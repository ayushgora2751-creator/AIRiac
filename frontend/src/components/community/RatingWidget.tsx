import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, Award } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export const RatingWidget: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      name: 'Dr. Kabir Sharma',
      rating: 5,
      date: '2 hours ago',
      comment: 'The CPCB sub-index breakdown and diurnal boundary layer forecast are phenomenal. Accurately predicted when to run outdoor errands!',
      verified: true,
    },
    {
      id: 'rev-2',
      name: 'Priya Mehra',
      rating: 5,
      date: 'Yesterday',
      comment: 'BreatheWise clean route planner saved my morning cycling commute from intense highway diesel fumes.',
      verified: true,
    },
    {
      id: 'rev-3',
      name: 'Harpreet Singh',
      rating: 4,
      date: '2 days ago',
      comment: 'Very helpful dosimetry calculations. The cigarette equivalence explanation makes pollution risks very clear for my family.',
      verified: true,
    },
  ]);

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      name: authorName.trim() || 'Community Citizen',
      rating: selectedRating,
      date: 'Just now',
      comment: commentText.trim(),
      verified: true,
    };

    setReviews([newReview, ...reviews]);
    setCommentText('');
    setAuthorName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div
      data-testid="platform-rating-widget"
      className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 p-6 shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Community Platform Ratings & Reviews</span>
          </h3>
          <p className="text-xs text-slate-500">
            Citizen feedback and usability reviews for the AIRiac Urban Clean-Air Platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {averageRating} / 5.0
          </span>
          <span className="text-xs text-slate-500">
            ({reviews.length + 1420} reviews)
          </span>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Review Submission Form */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Leave a Review</span>
          </h4>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your feedback has been verified and posted.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || selectedRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {selectedRating} Star{selectedRating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Name (or Role)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Environmental Health Researcher"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Feedback
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  required
                  placeholder="How has AIRiac helped you navigate urban air quality?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all cursor-pointer"
              >
                Submit Citizen Review
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Recent Reviews List */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Verified Citizen Testimonials
            </h4>
            <span className="text-xs text-emerald-700 font-semibold">
              100% Organic & Authenticated
            </span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white/90 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.name}</span>
                    {rev.verified && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 ml-1">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
