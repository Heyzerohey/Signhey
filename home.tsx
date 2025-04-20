import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PriceCard from "@/components/price-card";
import SubscriptionModal from "@/components/subscription-modal";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { useUser } from "@/components/user-context";
import { Check, AlertCircle } from "lucide-react";

const Home = () => {
  const { user } = useUser();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');

  const handleSubscribe = (tier: string) => {
    setSelectedTier(tier);
    setShowSubscriptionModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl md:text-6xl">
                  <span className="block">Legal document signing</span>
                  <span className="block text-primary">made simple</span>
                </h1>
                <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Streamline your document signing process with our secure, efficient, and user-friendly platform. Perfect for legal professionals, businesses, and individuals.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    {user ? (
                      <Button asChild size="lg">
                        <Link href="/dashboard">Go to Dashboard</Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <Link href="/#signup">Get started</Link>
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button variant="outline" size="lg" asChild>
                      <Link href="#demo">Live demo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full" src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt="Person signing document" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Everything you need for document signing</p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
              Our platform simplifies the document signing process while ensuring legal compliance and security.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature cards */}
              {features.map((feature, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-slate-900">{feature.title}</h3>
                    </div>
                    <div className="mt-4 text-base text-slate-500">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className="py-12 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Three simple steps to get documents signed</p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
              Our streamlined process makes document signing efficient and hassle-free.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              {/* Progress line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2"></div>
              
              <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-8">
                {/* Steps */}
                {steps.map((step, index) => (
                  <div key={index} data-step={index + 1} className="md:flex md:flex-col md:items-center">
                    <div className="flex items-center md:flex-col">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white text-lg font-medium z-10">
                        {index + 1}
                      </div>
                      <h3 className="ml-4 md:ml-0 md:mt-4 text-xl font-medium text-slate-900 md:text-center">{step.title}</h3>
                    </div>
                    <div className="mt-4 text-base text-slate-500 md:text-center">
                      {step.description}
                    </div>
                    <div className="mt-6 md:flex md:justify-center">
                      <img className="h-48 w-full object-cover rounded-lg md:w-52" src={step.image} alt={step.title} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 text-center">
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">Try it now</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/#signup">Try it now</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary">Pricing</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Plans for companies of all sizes</p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
              Choose the plan that works best for your needs. All plans include our core features.
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
            <PriceCard tier="free" currentTier={user?.tier} onSubscribe={handleSubscribe} />
            <PriceCard tier="pro" currentTier={user?.tier} onSubscribe={handleSubscribe} />
            <PriceCard tier="enterprise" currentTier={user?.tier} onSubscribe={handleSubscribe} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold tracking-wide uppercase text-primary">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">What our customers say</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                    <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic">{testimonial.quote}</p>
                <div className="mt-4 flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to streamline your document signing process?
            </h2>
            <p className="mt-4 text-xl text-orange-100">
              Join thousands of satisfied users who have simplified their document workflows.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                {user ? (
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/#signup">Get started for free</Link>
                  </Button>
                )}
              </div>
              <div className="ml-3 inline-flex">
                <Button variant="outline" size="lg" className="bg-primary-dark/50 text-white border-orange-400 hover:bg-primary-dark">
                  Request a demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      <SubscriptionModal 
        open={showSubscriptionModal} 
        tier={selectedTier}
        onClose={() => setShowSubscriptionModal(false)} 
      />

      <Footer />
    </div>
  );
};

// Features data
const features = [
  {
    title: "Legally Binding Signatures",
    description: "All signatures are legally binding and comply with eSignature laws worldwide including ESIGN, UETA, and eIDAS.",
    icon: Check
  },
  {
    title: "Bank-Level Security",
    description: "Your documents are protected with 256-bit encryption, secure cloud storage, and detailed audit trails.",
    icon: (props: any) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: "Automated Workflows",
    description: "Set up document workflows with sequenced signing, reminders, and notifications to speed up your process.",
    icon: (props: any) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Document Templates",
    description: "Create and save templates for frequently used documents to save time and ensure consistency.",
    icon: (props: any) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: "Mobile Friendly",
    description: "Sign documents from anywhere on any device with our responsive mobile interface.",
    icon: (props: any) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Preview & Live Modes",
    description: "Test your document flows in Preview mode before sending them for actual signatures in Live mode.",
    icon: (props: any) => (
      <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
];

// Steps data
const steps = [
  {
    title: "Upload Your Document",
    description: "Upload any PDF or Word document that requires signatures. Our system will automatically detect signature fields or you can manually place them.",
    image: "https://images.unsplash.com/photo-1568435122944-eb18553d9a72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    title: "Add Signers",
    description: "Specify who needs to sign the document. Add email addresses, set the signing order, and include personalized messages.",
    image: "https://images.unsplash.com/photo-1517431050652-31c2f6e2b346?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  },
  {
    title: "Get Documents Signed",
    description: "We'll notify signers and guide them through the signing process. You'll receive updates and the completed document once all signatures are collected.",
    image: "https://images.unsplash.com/photo-1560575193-c9a233919039?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
  }
];

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Legal Consultant",
    quote: "Signhey has revolutionized our contract signing process. What used to take days now takes minutes, and the interface is incredibly intuitive.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
  },
  {
    name: "Michael Chen",
    role: "Startup Founder",
    quote: "As a startup, we needed a solution that was affordable but also professional. Signhey's tiered pricing is perfect, and the Preview mode lets us test without using our quota.",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
  },
  {
    name: "David Rodriguez",
    role: "Real Estate Agent",
    quote: "In real estate, time is money. Signhey has cut our closing times significantly. The templates feature is especially useful for our standard agreements.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
  }
];

export default Home;
