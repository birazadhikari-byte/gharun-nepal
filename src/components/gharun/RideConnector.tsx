import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Navigation, Clock, AlertTriangle, CheckCircle2, Phone,
  ChevronRight, Star, Shield, Info, ArrowRight, Loader2, X, Car
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchVehicleTypes, fetchServiceAreas, fetchActiveRideDrivers, createRideRequest
} from '@/lib/database';

const GHARUN_WHATSAPP = '9779713242471';


interface RideConnectorProps {
  onNavigate: (view: string) => void;
  onLogin: () => void;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  auto: (
    <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="48" height="28" rx="6" fill="#FCD34D" stroke="#92400E" strokeWidth="2"/>
      <circle cx="18" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <circle cx="46" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <rect x="14" y="24" width="16" height="12" rx="2" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <rect x="34" y="24" width="16" height="12" rx="2" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <path d="M20 14 L32 8 L44 14 L44 20 L20 20 Z" fill="#FCD34D" stroke="#92400E" strokeWidth="2"/>
    </svg>
  ),
  safari: (
    <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="48" height="28" rx="6" fill="#34D399" stroke="#065F46" strokeWidth="2"/>
      <circle cx="18" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <circle cx="46" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <rect x="14" y="24" width="16" height="12" rx="2" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <rect x="34" y="24" width="16" height="12" rx="2" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <path d="M20 14 L32 8 L44 14 L44 20 L20 20 Z" fill="#34D399" stroke="#065F46" strokeWidth="2"/>
      <circle cx="52" cy="16" r="4" fill="#FCD34D" stroke="#92400E" strokeWidth="1"/>
    </svg>
  ),
  car: (
    <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="26" width="52" height="22" rx="4" fill="#93C5FD" stroke="#1E40AF" strokeWidth="2"/>
      <circle cx="18" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <circle cx="46" cy="52" r="5" fill="#374151" stroke="#1F2937" strokeWidth="2"/>
      <path d="M14 26 L20 14 L44 14 L50 26" fill="#93C5FD" stroke="#1E40AF" strokeWidth="2"/>
      <rect x="12" y="28" width="14" height="10" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
      <rect x="38" y="28" width="14" height="10" rx="2" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5"/>
    </svg>
  ),
};

const RideConnector: React.FC<RideConnectorProps> = ({ onNavigate, onLogin }) => {
  const { user } = useAuth();
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    userName: '',
    userPhone: '',
    pickupLocation: '',
    dropLocation: '',
    areaId: '',
    vehicleTypeId: '',
    urgency: 'now' as 'now' | 'scheduled',
    scheduledTime: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [vt, sa] = await Promise.all([
        fetchVehicleTypes().catch(() => []),
        fetchServiceAreas().catch(() => []),
      ]);
      setVehicleTypes(vt);
      setServiceAreas(sa);
    } catch (err) {
      console.error('Failed to load ride data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load available drivers when area/vehicle changes
  useEffect(() => {
    if (form.areaId || form.vehicleTypeId) {
      fetchActiveRideDrivers(form.areaId || undefined, form.vehicleTypeId || undefined)
        .then(setAvailableDrivers)
        .catch(() => setAvailableDrivers([]));
    }
  }, [form.areaId, form.vehicleTypeId]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        userName: prev.userName || user.name || '',
        userPhone: prev.userPhone || user.phone || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName || !form.userPhone || !form.pickupLocation || !form.dropLocation) return;

    setSubmitting(true);
    try {
      const result = await createRideRequest({
        user_name: form.userName,
        user_phone: form.userPhone,
        pickup_location: form.pickupLocation,
        drop_location: form.dropLocation,
        area_id: form.areaId || undefined,
        vehicle_type_id: form.vehicleTypeId || undefined,
        preferred_vehicle: vehicleTypes.find(v => v.id === form.vehicleTypeId)?.name || '',
        urgency: form.urgency,
        scheduled_time: form.urgency === 'scheduled' ? form.scheduledTime : undefined,
        notes: form.notes || undefined,
        user_id: user?.id || undefined,
      });
      setRequestNumber(result.request_number);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit ride request:', err);
      alert('Failed to submit request. Please try again or call Gharun Connect.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicle = vehicleTypes.find(v => v.id === form.vehicleTypeId);

  if (loading) {
    return (
      <section className="py-20 min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading Auto & City Safari Connector...</p>
        </div>
      </section>
    );
  }

  // Success state
  if (submitted) {
    return (
      <section className="py-12 min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-green-200 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-4">We will connect you with available local drivers nearby.</p>
            
            <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Your Request Number</p>
              <p className="text-2xl font-extrabold text-green-800 tracking-wider">{requestNumber}</p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-amber-800">What happens next?</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>Gharun Connect will notify nearby drivers</li>
                    <li>An available driver will contact you directly</li>
                    <li>You and the driver agree on terms directly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent(`Namaste! My ride request number is ${requestNumber}. Please help me connect with a driver.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact Gharun Connect via WhatsApp
              </a>
              <button
                onClick={() => { setSubmitted(false); setShowForm(false); setForm({ userName: user?.name || '', userPhone: user?.phone || '', pickupLocation: '', dropLocation: '', areaId: '', vehicleTypeId: '', urgency: 'now', scheduledTime: '', notes: '' }); }}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                New Request
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="w-full px-6 py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Gharun Nepal only connects users with local service providers. Travel agreements are between user and driver. Gharun Nepal does not own, operate, rent, or control vehicles, and does not fix prices.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Transportation & Mobility
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">
                Auto & City Safari<br />
                <span className="text-amber-200">Connector</span>
              </h1>
              <p className="text-lg text-amber-100 mb-2 max-w-xl">
                Connect with verified local drivers for short-distance travel across Jhapa District.
              </p>
              <p className="text-sm text-amber-200/80 mb-6 max-w-lg">
                Auto-rickshaws, electric city safari 3-wheelers, and local rental cars — all connected through Gharun Nepal.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-white text-amber-800 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors shadow-lg flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> Request a Ride
                </button>
                <a
                  href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need a ride. Can you connect me with a local driver?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call for Ride
                </a>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="grid grid-cols-3 gap-4">
                {vehicleTypes.map((vt, i) => (
                  <div key={vt.id} className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 ${i === 1 ? 'transform -translate-y-4' : ''}`}>
                    <div className="flex justify-center mb-3">
                      {vehicleIcons[vt.icon] || <Car className="w-10 h-10" />}
                    </div>
                    <p className="text-sm font-bold">{vt.name}</p>
                    <p className="text-xs text-amber-200 mt-1">{vt.name_np}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Disclaimer Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Gharun Nepal is a Connector, Not a Transport Provider</p>
            <p className="text-xs text-blue-600 mt-1">
              Gharun Nepal only connects users with local service providers. Travel agreements are between user and driver.
              We do not own, operate, rent, or control vehicles, and we do not fix prices.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: How It Works + Vehicle Types */}
          <div className="lg:col-span-1 space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Tell Us Where', desc: 'Enter your pickup and drop location' },
                  { step: '2', title: 'Choose Vehicle', desc: 'Auto, City Safari, or Car' },
                  { step: '3', title: 'We Connect', desc: 'Nearby drivers get notified' },
                  { step: '4', title: 'Direct Contact', desc: 'Driver contacts you directly' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Types */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">Available Vehicles</h3>
              <div className="space-y-3">
                {vehicleTypes.map((vt) => (
                  <div key={vt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0">
                      {vehicleIcons[vt.icon] || <Car className="w-8 h-8 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{vt.name}</p>
                      <p className="text-xs text-gray-500">{vt.description}</p>
                    </div>
                    {vt.enabled && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex-shrink-0">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area.id} className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {area.area_name}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3">All areas within Jhapa District, Nepal</p>
            </div>

            {/* Available Drivers Count */}
            {availableDrivers.length > 0 && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-sm font-bold text-green-800">
                    {availableDrivers.filter(d => d.available).length} Drivers Available
                  </h3>
                </div>
                <div className="space-y-2">
                  {availableDrivers.filter(d => d.available).slice(0, 4).map((driver) => (
                    <div key={driver.id} className="flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 bg-green-200 rounded-full flex items-center justify-center">
                        <Car className="w-3.5 h-3.5 text-green-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">{driver.name}</p>
                        <p className="text-green-600">{driver.ride_vehicle_types?.name} - {driver.ride_service_areas?.area_name}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5 text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold">{driver.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Request Form */}
          <div className="lg:col-span-2">
            {!showForm ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 lg:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-10 h-10 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Need a Ride?</h2>
                  <p className="text-gray-600 mb-6">
                    We will connect you with available local drivers nearby. No fixed pricing — you and the driver agree directly.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-base hover:bg-amber-700 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                  >
                    Request a Ride <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {vehicleTypes.map((vt) => (
                      <button
                        key={vt.id}
                        onClick={() => { setForm(prev => ({ ...prev, vehicleTypeId: vt.id })); setShowForm(true); }}
                        className="p-4 bg-gray-50 rounded-2xl hover:bg-amber-50 hover:border-amber-300 border-2 border-transparent transition-all group"
                      >
                        <div className="flex justify-center mb-2">
                          {vehicleIcons[vt.icon] || <Car className="w-8 h-8 text-gray-400" />}
                        </div>
                        <p className="text-xs font-bold text-gray-700 group-hover:text-amber-800">{vt.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{vt.name_np}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-5 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold">Request a Ride</h2>
                    <p className="text-sm text-amber-200">We'll connect you with nearby drivers</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Vehicle Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Preferred Vehicle</label>
                    <div className="grid grid-cols-3 gap-3">
                      {vehicleTypes.map((vt) => (
                        <button
                          key={vt.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, vehicleTypeId: vt.id }))}
                          className={`p-4 rounded-2xl border-2 transition-all text-center ${
                            form.vehicleTypeId === vt.id
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-gray-200 bg-gray-50 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex justify-center mb-2">
                            {vehicleIcons[vt.icon] || <Car className="w-8 h-8 text-gray-400" />}
                          </div>
                          <p className="text-xs font-bold text-gray-800">{vt.name}</p>
                          <p className="text-[10px] text-gray-500">{vt.name_np}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pickup & Drop */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
                      <input
                        type="text"
                        value={form.pickupLocation}
                        onChange={(e) => setForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                        placeholder="Pickup location *"
                        required
                        className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                    <div className="flex justify-center">
                      <div className="w-0.5 h-6 bg-gray-300" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
                      <input
                        type="text"
                        value={form.dropLocation}
                        onChange={(e) => setForm(prev => ({ ...prev, dropLocation: e.target.value }))}
                        placeholder="Drop location *"
                        required
                        className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Area Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Service Area</label>
                    <select
                      value={form.areaId}
                      onChange={(e) => setForm(prev => ({ ...prev, areaId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="">Select area (optional)</option>
                      {serviceAreas.map((area) => (
                        <option key={area.id} value={area.id}>{area.area_name} ({area.area_name_np})</option>
                      ))}
                    </select>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">When do you need it?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, urgency: 'now' }))}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          form.urgency === 'now'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.urgency === 'now' ? 'bg-amber-200' : 'bg-gray-100'}`}>
                          <Navigation className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">Now</p>
                          <p className="text-[10px] text-gray-500">ASAP pickup</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, urgency: 'scheduled' }))}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          form.urgency === 'scheduled'
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.urgency === 'scheduled' ? 'bg-amber-200' : 'bg-gray-100'}`}>
                          <Clock className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-900">Scheduled</p>
                          <p className="text-[10px] text-gray-500">Pick a time</p>
                        </div>
                      </button>
                    </div>
                    {form.urgency === 'scheduled' && (
                      <input
                        type="datetime-local"
                        value={form.scheduledTime}
                        onChange={(e) => setForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* User Details */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        value={form.userName}
                        onChange={(e) => setForm(prev => ({ ...prev, userName: e.target.value }))}
                        placeholder="Full name"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        value={form.userPhone}
                        onChange={(e) => setForm(prev => ({ ...prev, userPhone: e.target.value }))}
                        placeholder="+977-98XXXXXXXX"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Additional Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special requirements, landmarks, etc."
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !form.userName || !form.userPhone || !form.pickupLocation || !form.dropLocation}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl font-extrabold text-base hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Connecting you...</>
                    ) : (
                      <><Navigation className="w-5 h-5" /> Connect Me with a Driver</>
                    )}
                  </button>

                  {/* Disclaimer */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        <strong>Disclaimer:</strong> Gharun Nepal only connects users with local service providers.
                        Travel agreements are between user and driver. No driver is forced to accept any request.
                        Gharun Nepal does not own, operate, rent, or control vehicles, and does not fix prices.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-12 grid sm:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Verified Drivers', desc: 'All drivers are admin-verified', color: 'bg-green-50 text-green-700 border-green-200' },
            { icon: Navigation, title: 'Quick Connect', desc: 'Nearby drivers notified instantly', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { icon: Phone, title: 'Direct Contact', desc: 'Talk to driver directly', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { icon: AlertTriangle, title: 'No Hidden Fees', desc: 'We don\'t fix prices', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          ].map((item, i) => (
            <div key={i} className={`${item.color} rounded-2xl p-5 border text-center`}>
              <item.icon className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-bold">{item.title}</p>
              <p className="text-xs opacity-80 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RideConnector;
