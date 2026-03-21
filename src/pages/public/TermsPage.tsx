import React from 'react';
import { ChevronLeft, Scale, Clock, Shield, Globe, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
  <section id={id} className="mb-12 scroll-mt-24">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
      {children}
    </div>
  </section>
);

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Globe size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">Lingland</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/request" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Book Now</Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-3">On this page</p>
              {[
                { id: 'services', title: 'Services', icon: Globe },
                { id: 'delivery', title: 'Delivery', icon: Clock },
                { id: 'obligations', title: 'Our Obligations', icon: Shield },
                { id: 'customer', title: 'Your Obligations', icon: CheckCircle2 },
                { id: 'confidentiality', title: 'Confidentiality', icon: Scale },
                { id: 'payments', title: 'Payments', icon: CreditCard },
                { id: 'termination', title: 'Termination', icon: AlertTriangle },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all group"
                >
                  <item.icon size={16} className="text-slate-300 group-hover:text-blue-500" />
                  {item.title}
                </a>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">Terms and Conditions of Service</h1>
              <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase">Official Policy</span>
                <span>•</span>
                <span>Last Revision: August 2023</span>
              </div>
            </div>

            <Section id="services" title="1. Services" icon={Globe}>
              <p>1.1 In response to an order, the Customer designates Lingland to provide the Services, and Lingland undertakes to do so in accordance with the provisions of this Agreement. Except for last-minute arrangements, all orders must be placed using the online booking form.</p>
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 border-l-4 border-l-blue-600">
                <p className="text-blue-900 font-medium">1.2 Quotes are only an offer to the customer to do a job at a specified price, and a contract won’t exist until this offer is accepted by both parties and Lingland sends a written or electronic confirmation of the order to the customer. Lingland Will not charge you more than what is stated on the quote unless you agree to extra work, or the scope of the job changes while it is underway.</p>
              </div>
            </Section>

            <Section id="delivery" title="2. Delivery" icon={Clock}>
              <p>2.1 On writen translations, time is not of the essence for delivery or performance, and any delay will not entitle the customer to reject any delivery or performance or to repudiate or terminate the Agreement. The dates for delivery of the translated works or the dates for performing the services are only estimates unless otherwise expressly agreed by Lingland.</p>
            </Section>

            <Section id="obligations" title="3. Lingland’s Obligations" icon={Shield}>
              <p>3.1 Lingland promises and accepts responsibility for always performing or arranging for the provision of the services in line with Good Industry Practice while this Agreement is in effect.</p>
              <p>3.2 To provide the services in line with the conditions of this Agreement, Lingland shall choose the relevant and qualified resource with all reasonable care and competence.</p>
              <p>3.3 Lingland shall make a reasonable effort to offer the services in accordance with the terms of the quote by the client. The customer understands that even when transmitted in encrypted form, any original or translated works or face-to-face interpreting services submitted by either party over the internet cannot be guaranteed to be error-free or free from the risk of interception, and that Lingland is not responsible for any loss, corruption, or interception of such original or translated works or services.</p>
              <p>3.4 Lingland will not assume any express or implied, statutory, or otherwise, warranties, conditions, undertakings, or terms regarding the state, quality, performance, or suitability of the services, except as expressly provided in this Agreement. To the fullest extent permitted by law, all such warranties, conditions, undertakings, and terms are excluded from this Agreement.</p>
              <p>3.5 Lingland is not obligated to verify the veracity of the original works.</p>
              <p>3.6 Lingland is only required to keep original works and translated works for a period of 12 months after receiving the original works for the purpose of returning them to the customer upon termination or expiration of this Agreement or upon the reasonable request of the customer at any time while this Agreement is still in effect. After 12 months of receiving original works from the client, Lingland is under no obligation to give the customer any original works or translated works.</p>
              <p>3.7 The interpreter’s work is limited to spoken discourse and does not include translating any texts into writing.</p>
              <p>3.8 Unless otherwise stated, the format of Translation Works will, if feasible, follow the format of Original Works, unless specifically requested otherwise by the Customer at the quote stage and/or as otherwise advised by Lingland.</p>
              <p>3.9 The quotation presupposes that all the document’s text is readable; any unintelligible text will be disclosed to the customer.</p>
            </Section>

            <Section id="customer" title="4. Customer’s Obligations" icon={CheckCircle2}>
               <p>4.1 The Client guarantees Lingland that it will always comply with the following obligations during the term of this Agreement:</p>
               <ul className="list-disc pl-5 space-y-2">
                 <li>4.1.1 Acquire and keep up to date any authorizations, consents, and licenses required for Lingland to carry out its duties under this Agreement;</li>
                 <li>4.1.2 Fulfil Lingland’s reasonable requests for information and materials to deliver the services and fulfil its responsibilities under this Agreement;</li>
                 <li>4.1.3 Abide by the conditions of any software license agreement that may have been in effect at the time between the parties;</li>
                 <li>4.1.4 Possess the necessary corporate power and capacity to sign this Agreement.</li>
               </ul>
               <p>4.2 The customer designates Lingland as the only provider of the services to the customer, unless otherwise agreed, and the customer agrees that it will not designate anyone else to provide the services to the client.</p>
               <p>4.3 If the client requests that Lingland provide the services on the client’s property or any other location they designate, the client shall make sure information is true/complete and premises have relevant safety measures.</p>
               <p>4.4 Lingland is allowed to charge any additional fees incurred because of dangerous situations or materials encountered on the client’s property.</p>
               <p>4.5 <strong>Recordings:</strong> Unless a recording is required for legal procedures, an interpreter’s work cannot be captured on tape without prior authorization. Publishing/broadcast recordings may incur extra charges.</p>
               <p>4.6 Lingland is not required to continue services if the customer violates warranties or if Lingland believes people are in danger.</p>
               <p>4.7 <strong>Grievances:</strong> The client must inform Lingland of any grievances or inaccuracies within 30 days of service. Revisions requested after 30 days may incur extra fees.</p>
               <p>4.8 Before ordering each translation, the customer must choose the document type, styles, font, layout, etc. Original format will be used as default.</p>
               <p>4.9 The Client is required to deliver style guides/glossaries. Lacking these, linguists use best judgement; adjustments later may incur charges.</p>
            </Section>

            <Section id="confidentiality" title="5. Confidentiality" icon={Scale}>
              <p>5.1 “Confidential Information” refers to any information marked as confidential or obviously confidential by nature. Conditions of this Agreement are also confidential.</p>
              <p>5.2 Receiving Party may only use Confidential Information to fulfil duties under this Agreement.</p>
              <p>5.3 Security measures no less than those used for own secret information must be exercised.</p>
              <p>5.4 Disclosure is restricted to employees/agents whose duties require it. Third parties must sign equivalent confidentiality terms.</p>
              <p>5.5 Upon request or termination, party must destroy or return all Confidential Information.</p>
              <p>5.6 Parties acknowledge damages may not suffice for breach; injunctions and equitable relief may be sought.</p>
              <p>5.7 Information becomes public or obtained independently is not considered confidential.</p>
            </Section>

            <Section id="payments" title="6. Payments" icon={CreditCard}>
              <p>6.1 The client must pay fees outlined in the quote or at current rate.</p>
              <p>6.2 Lingland will invoice for fees, VAT, and relevant taxes.</p>
              <p>6.3 Fees reevaluated annually. Booking confirmations will include all job details. Phone/vocal bookings will also be confirmed. Client is responsible for verifying the accuracy of details.</p>
              <p>6.4 <strong>Payment Terms:</strong> All fees must be paid within 30 days of invoice date.</p>
              <p>6.5/6.6 <strong>Late Payments:</strong> Lingland may stop accepting work if undisputed sums remain unpaid after 30 days' notice.</p>
              <p>6.7 <strong>Late Fees:</strong> £40.00 late fee applies after 30 days, plus additional £40.00 admin charge for each subsequent 30-day period.</p>
              <p>6.8 <strong>Disputed Invoices:</strong> Written notice required within 14 days. Disputes resolved via Section 9.</p>
              <p>6.9 - 6.13 Details on taxes, withholdings, quotation validity (30 days), and currency (GBP).</p>
            </Section>

            <Section id="termination" title="7. Termination" icon={AlertTriangle}>
              <p>7.1 Lasts until services rendered or terminated.</p>
              <p>7.2 Immediate termination possible for material breach (unremedied), bankruptcy, or Force Majeure (3+ months).</p>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2">7.3 Cancellation Policy</h4>
                <p className="text-amber-800 mb-4">Must be made at least one full calendar day before the booking (e.g., if scheduled for 14th, cancel by 12th).</p>
                <p className="text-amber-800">Cancellations on the day before or day of the booking will be <strong>charged in full</strong>. Travel fees will not be charged.</p>
              </div>
            </Section>

            <Section id="jurisdiction" title="10. Jurisdiction" icon={Shield}>
              <p>This Agreement is governed by English law and the parties submit to the exclusive jurisdiction of the English courts.</p>
            </Section>

            <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Questions?</p>
                  <p className="text-sm font-bold text-slate-900">Contact our Legal Team</p>
                </div>
              </div>
              <a href="mailto:info@lingland.net" className="w-full sm:w-auto text-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
                Email info@lingland.net
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Lingland Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
