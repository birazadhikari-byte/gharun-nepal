import React from 'react';
import { Star, Quote, Shield } from 'lucide-react';
import { t } from '@/lib/i18n';

const testimonials = [
  {
    name: 'Sushma Adhikari',
    location: 'Jhapa, Birtamode / झापा, बिर्तामोड',
    text: 'I was worried about hiring a plumber directly. Gharun Nepal verified everything and the work was excellent. I felt safe throughout the process.',
    textNp: 'प्लम्बर सिधै भाडामा लिन चिन्तित थिएँ। घरन नेपालले सबै कुरा प्रमाणित गर्यो र काम उत्कृष्ट थियो। म सुरक्षित महसुस गरें।',
    rating: 5,
    service: 'Plumbing / प्लम्बिङ',
    image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565948946_8812de55.png',
  },
  {
    name: 'Prakash Shrestha',
    location: 'Jhapa, Damak / झापा, दमक',
    text: 'The coordination team was amazing. They confirmed everything before sending the electrician. No surprises, fair pricing, and quality work.',
    textNp: 'समन्वय टोली अद्भुत थियो। इलेक्ट्रिसियन पठाउनु अघि सबै कुरा पुष्टि गर्यो। कुनै आश्चर्य छैन, उचित मूल्य, र गुणस्तरीय काम।',
    rating: 5,
    service: 'Electrical / बिजुली',
    image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565897585_c9d60157.png',
  },
  {
    name: 'Anita Maharjan',
    location: 'Jhapa, Bhadrapur / झापा, भद्रपुर',
    text: 'As a single woman, I appreciate that Gharun Nepal handles everything. I never had to share my address with strangers. The cleaning service was top-notch!',
    textNp: 'एक्लो महिलाको रूपमा, घरन नेपालले सबै कुरा सम्हाल्छ भन्ने कुरा मलाई मन पर्छ। मैले अपरिचितहरूसँग ठेगाना साझा गर्नु परेन। सफाई सेवा उत्कृष्ट थियो!',
    rating: 5,
    service: 'Cleaning / सफाई',
    image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565935344_df15a23c.jpg',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-[#F5F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8102E]/10 rounded-full mb-4">
            <Shield className="w-4 h-4 text-[#C8102E]" />
            <span className="text-sm font-semibold text-[#C8102E]">{t.testimonials.badge.en}</span>
            <span className="text-xs text-[#C8102E]/70">{t.testimonials.badge.np}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {t.testimonials.title.en.replace('Clients', '')} <span className="text-[#C8102E]">Clients</span> Say
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.testimonials.title.np}</p>
          <p className="mt-4 text-lg text-gray-600">{t.testimonials.subtitle.en}</p>
          <p className="text-sm text-gray-400 mt-1">{t.testimonials.subtitle.np}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 relative">
              <div className="absolute -top-3 right-6">
                <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center shadow-md">
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2 italic">"{testimonial.text}"</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 italic">"{testimonial.textNp}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img src={testimonial.image} alt={testimonial.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
                <span className="ml-auto px-2 py-1 bg-[#C8102E]/10 text-[#C8102E] rounded-full text-xs font-semibold">
                  {testimonial.service}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
