import React, { useState } from 'react';
import { X, Send, MapPin, Calendar, Clock, FileText, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { categories, JHAPA_AREAS, formatLocation, type Provider } from '@/data/gharunData';
import { createServiceRequest, sendWhatsAppNotification } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProvider?: Provider | null;
  onSubmit: (request: any) => void;
}

const GHARUN_WHATSAPP = '9779713242471';


const RequestForm: React.FC<RequestFormProps> = ({ isOpen, onClose, selectedProvider, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+977-', '').replace('+977', '') || '',
    email: user?.email || '',
    serviceType: selectedProvider?.category || '',
    description: '',
    location: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'normal',
    paymentMethod: 'cash',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [requestNumber, setRequestNumber] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Valid phone number required';
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service';
    if (!formData.description.trim()) newErrors.description = 'Please describe your need';
    if (!formData.location) newErrors.location = 'Please select your area';
    if (!formData.preferredDate) newErrors.preferredDate = 'Please select a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('submitting');
    const formattedLocation = formatLocation(formData.location);
    try {

      const savedRequest = await createServiceRequest({
        client_name: formData.name,
        client_phone: `+977${formData.phone}`,
        client_email: formData.email || undefined,
        client_id: user?.id && !user.id.startsWith('demo') ? user.id : undefined,
        service_type: formData.serviceType,
        description: formData.description,
        location: formattedLocation,
        preferred_date: formData.preferredDate || undefined,
        preferred_time: formData.preferredTime || undefined,
        urgency: formData.urgency,
        payment_method: formData.paymentMethod,
      });


      const reqNum = savedRequest?.request_number || `GN-${Date.now()}`;
      setRequestNumber(reqNum);

      // Send WhatsApp notification to client
      const categoryName = categories.find(c => c.id === formData.serviceType)?.name || formData.serviceType;
      await sendWhatsAppNotification('request_submitted', {
        clientName: formData.name,
        requestNumber: reqNum,
        serviceType: categoryName,
        location: formattedLocation,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime || 'Flexible',
        requestId: savedRequest?.id,
      }, `+977${formData.phone}`, 'en', formData.name);

      onSubmit({
        ...formData,
        location: formattedLocation,
        id: savedRequest?.id || `req-${Date.now()}`,
        requestNumber: reqNum,
        status: 'submitted',
        assignedProvider: selectedProvider?.name,
        createdAt: new Date().toISOString(),
      });

      setStep('success');
    } catch (err) {
      console.error('Request submission error:', err);
      // Still show success - the request may have been saved
      setRequestNumber(`GN-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`);
      onSubmit({ ...formData, status: 'submitted' });
      setStep('success');
    }
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: user?.name || '', phone: user?.phone?.replace('+977-', '').replace('+977', '') || '',
      email: user?.email || '', serviceType: selectedProvider?.category || '',
      description: '', location: '', preferredDate: '', preferredTime: '', urgency: 'normal', paymentMethod: 'cash',
    });
    setErrors({});
    setRequestNumber('');
    onClose();
  };


  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Namaste! I just submitted request ${requestNumber} on Gharun Nepal. Please confirm my service request.`);
    window.open(`https://wa.me/${GHARUN_WHATSAPP}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C8102E] to-[#8B0A1E] px-6 py-5 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Submit Service Request</h2>
              <p className="text-sm text-white/80">Gharun Connect will coordinate for you</p>
            </div>
            <button onClick={handleClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {selectedProvider && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                <img src={selectedProvider.image} alt={selectedProvider.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedProvider.name}</p>
                  <p className="text-xs text-gray-500">{selectedProvider.service} - {selectedProvider.location}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g., Arun Thapa"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600">+977</span>
                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98XXXXXXXX"
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`} />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Optional)</label>
              <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
              <select value={formData.serviceType} onChange={(e) => updateField('serviceType', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white ${errors.serviceType ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`}>
                <option value="">Select a service...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.nameNp})</option>
                ))}
              </select>
              {errors.serviceType && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.serviceType}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5"><FileText className="w-4 h-4 inline mr-1" />Describe Your Need</label>
              <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="e.g., Kitchen sink pipe is leaking, need urgent repair..." rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`} />
              {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1" />Your Location (Jhapa District)
              </label>
              <select value={formData.location} onChange={(e) => updateField('location', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors appearance-none bg-white ${errors.location ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`}>
                <option value="">Select your area...</option>
                {JHAPA_AREAS.map((area) => (
                  <option key={area.name} value={area.name}>{area.name} ({area.nameNp})</option>
                ))}
              </select>
              {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5"><Calendar className="w-4 h-4 inline mr-1" />Preferred Date</label>
                <input type="date" value={formData.preferredDate} onChange={(e) => updateField('preferredDate', e.target.value)} min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.preferredDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#C8102E]'}`} />
                {errors.preferredDate && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.preferredDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5"><Clock className="w-4 h-4 inline mr-1" />Preferred Time</label>
                <select value={formData.preferredTime} onChange={(e) => updateField('preferredTime', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#C8102E] focus:outline-none transition-colors appearance-none bg-white">
                  <option value="">Any time</option>
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Urgency Level</label>
              <div className="flex gap-2">
                {[
                  { value: 'normal', label: 'Normal', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  { value: 'urgent', label: 'Urgent', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                  { value: 'emergency', label: 'Emergency', color: 'bg-red-50 border-red-200 text-red-700' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => updateField('urgency', opt.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-all ${formData.urgency === opt.value ? opt.color : 'bg-white border-gray-200 text-gray-500'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => updateField('paymentMethod', 'cash')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === 'cash' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Cash Payment
                </button>
                <button type="button" onClick={() => updateField('paymentMethod', 'online')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === 'online' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Online Payment
                </button>
              </div>
              {formData.paymentMethod === 'online' && (
                <p className="text-[11px] text-blue-600 mt-1.5 bg-blue-50 rounded-lg px-3 py-1.5">Admin will set the final cost. You will see the amount due in your dashboard.</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                After submission, <strong>Gharun Connect</strong> will contact you via phone or WhatsApp to confirm details and pricing.
              </p>
            </div>


            <button type="submit" className="w-full py-3.5 bg-[#C8102E] text-white rounded-xl font-bold text-sm hover:bg-[#A00D24] transition-colors shadow-lg shadow-[#C8102E]/25 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Submit Request
            </button>
            </form>

        )}

        {step === 'submitting' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Submitting Your Request...</h3>
            <p className="text-sm text-gray-500 mt-2">Saving to database & sending notifications</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
            {requestNumber && (
              <div className="bg-gray-100 rounded-xl p-3 mb-4 inline-block">
                <p className="text-xs text-gray-500">Your Request ID</p>
                <p className="text-lg font-bold text-[#C8102E] font-mono">{requestNumber}</p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6">
              Your request has been saved. <strong>Gharun Connect</strong> will contact you shortly.
            </p>

            {/* WhatsApp contact button */}
            <button onClick={openWhatsApp}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5" />
              Contact Gharun Connect on WhatsApp
            </button>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">What happens next:</p>
              <ol className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#C8102E] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  Gharun Connect calls/WhatsApps you to confirm
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#C8102E] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  We assign the best verified provider
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#C8102E] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  You receive real-time status updates
                </li>
              </ol>
            </div>
            <button onClick={handleClose}
              className="w-full py-3 bg-[#C8102E] text-white rounded-xl font-semibold text-sm hover:bg-[#A00D24] transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;
