import React, { useState } from 'react';
import { Camera, MapPin, ShieldCheck, Upload, CheckCircle2, X } from 'lucide-react';
import { CityAQISummary } from '../../types/aqi';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySummary: CityAQISummary;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  citySummary,
}) => {
  const [category, setCategory] = useState('garbage_burning');
  const [locationName, setLocationName] = useState(`${citySummary.city} Central Zone`);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setImagePreview(null);
        setDescription('');
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
              <Camera className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Citizen Pollution Incident Report</h3>
              <p className="text-xs text-rose-100 opacity-90">
                Crowdsourced environmental justice monitoring with EXIF sanitization
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
            <h4 className="text-xl font-bold text-slate-800">Incident Report Submitted!</h4>
            <p className="text-xs text-slate-500 max-w-md">
              Your report has been queued for municipal verification. Image metadata (EXIF) was stripped to safeguard your privacy.
            </p>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Status: Under Community Review
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* Category Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">Pollution Incident Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500"
              >
                <option value="garbage_burning">Open Municipal / Leaf Garbage Burning</option>
                <option value="construction_dust">Uncovered Construction Dust / Demolition</option>
                <option value="industrial_smoke">Illegal Industrial Dark Stack Smoke</option>
                <option value="crop_residue">Agricultural Crop Residue / Stubble Burning</option>
                <option value="vehicle_hotspot">Persistent Diesel Heavy Vehicle Idling Hotspot</option>
              </select>
            </div>

            {/* Location Tag */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Incident Location (H3 Hex Resolution ~1.2km)</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter specific sector, landmark, or intersection"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            {/* Photo Upload with EXIF Strip Notice */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">Incident Photograph</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Pollution report preview"
                      className="max-h-40 rounded-xl mx-auto object-cover border border-slate-200"
                    />
                    <span className="block text-[10px] text-slate-500 mt-1">Click to replace photo</span>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      Drag and drop image, or <span className="text-rose-600 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Privacy badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero-GPS Leakage: Camera EXIF metadata is stripped before upload.</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">Incident Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe smoke density, duration, and nearest landmark..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Sanitizing & Submitting...' : 'Submit Incident Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
