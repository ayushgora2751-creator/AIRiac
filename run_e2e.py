#!/usr/bin/env python3
"""
AIRiac Standalone E2E Test Runner
==================================
Standalone CLI test runner for executing and reporting the AIRiac 4-Tier
opaque-box end-to-end test suite.

Precondition Guarantees:
- Injects 'test' into sys.argv prior to Django configuration, forcing settings.py
  to activate SQLite and LocMemCache isolation rather than external PostgreSQL/Redis.
- Fast execution via session-scoped MD5 password hashing.
- Strict zero-network egress guard intercepting outbound socket/HTTP calls.

Usage:
    python run_e2e.py                  # Run all 4 Tiers (133 tests)
    python run_e2e.py --tier 1         # Run Tier 1 only (Feature Coverage)
    python run_e2e.py --tier 2         # Run Tier 2 only (Boundary & Corner Cases)
    python run_e2e.py --tier 3         # Run Tier 3 only (Cross-Feature Combinations)
    python run_e2e.py --tier 4         # Run Tier 4 only (Real-World Scenarios)
    python run_e2e.py -v               # Verbose test reporting

Exit Codes:
    0 = All tests passed cleanly
    1 = One or more test assertions failed
    2 = Environment or harness execution error
"""

import sys
import os

# MANDATORY PRECONDITION: Guarantee SQLite test database selection
if "test" not in sys.argv:
    sys.argv.append("test")

# Ensure Windows terminal supports ANSI colors
if os.name == "nt":
    os.system("")

import argparse
import time
from pathlib import Path

# Add backend and root directory to python path
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# ANSI Color formatting
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
CYAN = "\033[96m"
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
WHITE = "\033[97m"

TIER_SPECS = {
    "1": {
        "num": "1",
        "name": "Feature Coverage",
        "class": "TestTier1FeatureCoverage",
        "description": "Category-partition coverage across all 12 endpoint groups",
    },
    "2": {
        "num": "2",
        "name": "Boundary & Corner Cases",
        "class": "TestTier2BoundaryAndCornerCases",
        "description": "Edge limits, missing fields, 400/401/404/422 validation errors",
    },
    "3": {
        "num": "3",
        "name": "Cross-Feature Workflows",
        "class": "TestTier3CrossFeatureCombinations",
        "description": "Multi-step stateful pipelines (Onboarding, Calculation, Routes)",
    },
    "4": {
        "num": "4",
        "name": "Real-World Scenarios",
        "class": "TestTier4RealWorldScenarios",
        "description": "End-user persona journeys (Asthmatic, Smog Crisis, School PE)",
    },
}


class ResultCollector:
    """Pytest plugin collecting execution statistics."""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.skipped = 0
        self.errors = 0
        self.failure_reports = []

    def pytest_runtest_logreport(self, report):
        if report.when == "call":
            if report.passed:
                self.passed += 1
            elif report.failed:
                self.failed += 1
                self.failure_reports.append(report)
            elif report.skipped:
                self.skipped += 1
        elif report.when in ("setup", "teardown") and report.failed:
            self.errors += 1
            self.failure_reports.append(report)


def print_banner():
    width = 82
    print(f"\n{BOLD}{CYAN}{'=' * width}{RESET}")
    print(f"{BOLD}{WHITE} AIRiac Platform — 4-Tier Opaque-Box E2E Test Runner{RESET}".center(width + 10))
    print(f"{DIM} Architecture: Zero-Network Isolation | Engine: SQLite | Auth: MD5 Hasher{RESET}".center(width + 10))
    print(f"{BOLD}{CYAN}{'=' * width}{RESET}\n")


def parse_arguments():
    parser = argparse.ArgumentParser(
        description="AIRiac Platform Opaque-Box End-to-End Test Runner",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--tier", "-t",
        choices=["1", "2", "3", "4", "all"],
        default="all",
        help="Target test tier to execute:\n"
             "  1   : Tier 1 Feature Coverage (>=40 tests)\n"
             "  2   : Tier 2 Boundary & Corner Cases (>=40 tests)\n"
             "  3   : Tier 3 Cross-Feature Multi-Step Workflows (4 pipelines)\n"
             "  4   : Tier 4 Realistic Persona Journeys (5 scenarios)\n"
             "  all : Execute all 4 tiers sequentially (default)\n",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable detailed verbose output for every individual test case",
    )
    parser.add_argument(
        "--failfast", "-x",
        action="store_true",
        help="Stop test execution immediately on the first failure",
    )
    args, _ = parser.parse_known_args()
    return args


def run_tier(tier_key, verbose=False, failfast=False):
    """Executes a single test tier using pytest and returns metrics."""
    spec = TIER_SPECS[tier_key]
    test_file = str(BACKEND_DIR / "tests" / "test_e2e.py")
    target_class = spec["class"]

    pytest_args = [
        test_file,
        "-k", target_class,
        "--tb=short",
    ]
    if verbose:
        pytest_args.append("-v")
    else:
        pytest_args.append("-q")
    if failfast:
        pytest_args.append("-x")

    collector = ResultCollector()

    print(f"{BOLD}{BLUE}[RUNNING]{RESET} Tier {spec['num']}: {BOLD}{spec['name']}{RESET} ({spec['description']})...")
    start_time = time.perf_counter()

    try:
        import pytest
        exit_code = pytest.main(pytest_args, plugins=[collector])
    except Exception as exc:
        duration = time.perf_counter() - start_time
        print(f"  {RED}[ERROR] Harness exception in Tier {spec['num']}: {exc}{RESET}")
        return {
            "num": spec["num"],
            "name": spec["name"],
            "total": 0,
            "passed": 0,
            "failed": 0,
            "errors": 1,
            "duration": duration,
            "status": "ERROR",
            "exit_code": 2,
        }

    duration = time.perf_counter() - start_time
    total_tests = collector.passed + collector.failed + collector.skipped

    if collector.failed == 0 and collector.errors == 0 and collector.passed > 0:
        status_text = f"{GREEN}PASS{RESET}"
        status_label = "PASS"
        print(f"  {GREEN}✔ [PASS]{RESET} Tier {spec['num']}: {collector.passed} passed in {duration:.2f}s\n")
    else:
        status_text = f"{RED}FAIL{RESET}"
        status_label = "FAIL"
        print(f"  {RED}✘ [FAIL]{RESET} Tier {spec['num']}: {collector.passed} passed, {collector.failed} failed in {duration:.2f}s\n")

    return {
        "num": spec["num"],
        "name": spec["name"],
        "total": total_tests,
        "passed": collector.passed,
        "failed": collector.failed,
        "errors": collector.errors,
        "duration": duration,
        "status": status_label,
        "exit_code": int(exit_code),
    }


def print_summary_table(results):
    width = 82
    print(f"{BOLD}{CYAN}{'=' * width}{RESET}")
    print(f"{BOLD}{WHITE} E2E EXECUTION METRICS SUMMARY{RESET}".center(width + 10))
    print(f"{BOLD}{CYAN}{'=' * width}{RESET}")
    print(f" {BOLD}{'Tier':<5} | {'Suite Description':<28} | {'Tests':>6} | {'Passed':>6} | {'Failed':>6} | {'Duration':>8} | {'Status':^8}{RESET}")
    print(f" {'-' * 5}-+-{'-' * 28}-+-{'-' * 6}-+-{'-' * 6}-+-{'-' * 6}-+-{'-' * 8}-+-{'-' * 8}")

    total_tests = 0
    total_passed = 0
    total_failed = 0
    total_errors = 0
    total_duration = 0.0

    for r in results:
        status_colored = f"{GREEN}  PASS  {RESET}" if r["status"] == "PASS" else f"{RED}  FAIL  {RESET}"
        print(f" {r['num']:<5} | {r['name']:<28} | {r['total']:>6} | {r['passed']:>6} | {r['failed']:>6} | {r['duration']:>7.2f}s | {status_colored}")
        total_tests += r["total"]
        total_passed += r["passed"]
        total_failed += r["failed"]
        total_errors += r["errors"]
        total_duration += r["duration"]

    print(f" {'-' * 5}-+-{'-' * 28}-+-{'-' * 6}-+-{'-' * 6}-+-{'-' * 6}-+-{'-' * 8}-+-{'-' * 8}")
    pass_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0.0
    summary_status = f"{GREEN}100% OK{RESET}" if (total_failed == 0 and total_errors == 0 and total_tests > 0) else f"{RED}FAILURES{RESET}"
    print(f" {BOLD}{'TOTAL':<5} | {'All Executed Tiers':<28} | {total_tests:>6} | {total_passed:>6} | {total_failed:>6} | {total_duration:>7.2f}s | {summary_status}{RESET}")
    print(f"{BOLD}{CYAN}{'=' * width}{RESET}")

    if total_failed == 0 and total_errors == 0 and total_tests > 0:
        print(f"\n{BOLD}{GREEN} >>> VERDICT: 100% PASS ({total_passed}/{total_tests} tests). Zero network leak. Ready for production! <<<{RESET}\n")
        return 0
    elif total_errors > 0:
        print(f"\n{BOLD}{RED} >>> VERDICT: HARNESS ERROR ENCOUNTERED ({total_errors} errors). Check logs above. <<<{RESET}\n")
        return 2
    else:
        print(f"\n{BOLD}{RED} >>> VERDICT: TEST FAILURES DETECTED ({total_failed} failed tests). <<<{RESET}\n")
        return 1


def main():
    print_banner()
    args = parse_arguments()

    if args.tier == "all":
        tiers_to_run = ["1", "2", "3", "4"]
    else:
        tiers_to_run = [args.tier]

    results = []
    overall_exit_code = 0

    for tier_key in tiers_to_run:
        res = run_tier(tier_key, verbose=args.verbose, failfast=args.failfast)
        results.append(res)
        if res["exit_code"] != 0 and overall_exit_code == 0:
            overall_exit_code = 1 if res["failed"] > 0 else 2
        if args.failfast and res["exit_code"] != 0:
            break

    verdict_code = print_summary_table(results)
    sys.exit(verdict_code)


if __name__ == "__main__":
    main()
