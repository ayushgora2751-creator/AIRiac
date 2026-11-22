import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommunityReportsFeed } from '../../components/community/CommunityReportsFeed';
import { MOCK_CHANDIGARH_CITY_SUMMARY } from '../mocks/mockData';

describe('CommunityReportsFeed Component', () => {
  it('renders community reports list and verification badges', () => {
    const onOpenModal = vi.fn();
    render(
      <CommunityReportsFeed
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
        onOpenReportModal={onOpenModal}
      />
    );

    expect(screen.getByText(/Community Pollution Reports • Chandigarh/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Leaf & Waste Burning behind Sector Market/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CPCB Verified/i).length).toBeGreaterThan(0);
  });

  it('triggers report modal callback when + Report button is clicked', () => {
    const onOpenModal = vi.fn();
    render(
      <CommunityReportsFeed
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
        onOpenReportModal={onOpenModal}
      />
    );

    const reportBtn = screen.getByText(/\+ Report Local Hotspot/i);
    fireEvent.click(reportBtn);
    expect(onOpenModal).toHaveBeenCalledTimes(1);
  });

  it('increments upvote count on user click', () => {
    render(
      <CommunityReportsFeed
        citySummary={MOCK_CHANDIGARH_CITY_SUMMARY}
        onOpenReportModal={vi.fn()}
      />
    );

    const upvoteBtn = screen.getByText('19');
    fireEvent.click(upvoteBtn);
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
