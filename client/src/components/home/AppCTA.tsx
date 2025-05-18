import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AppleIcon, PlayIcon } from "lucide-react";

// Custom Apple icon
const AppleLogoIcon = () => (
  <svg className="h-6 w-6 mr-3" viewBox="0 0 384 512" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

// Custom Google Play icon
const GooglePlayIcon = () => (
  <svg className="h-6 w-6 mr-3" viewBox="0 0 512 512" fill="currentColor">
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
);

const AppCTA = () => {
  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 text-white md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                Get the UshopLS App
              </h2>
              <p className="text-lg mb-6">
                Shop anytime, anywhere with our mobile app. Get exclusive app-only deals and instant notifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="bg-black hover:bg-neutral-800 text-white border-none flex items-center justify-center sm:justify-start rounded-md py-3 px-6 h-auto transition">
                  <AppleLogoIcon />
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-base font-semibold">App Store</div>
                  </div>
                </Button>
                <Button variant="outline" className="bg-black hover:bg-neutral-800 text-white border-none flex items-center justify-center sm:justify-start rounded-md py-3 px-6 h-auto transition">
                  <GooglePlayIcon />
                  <div>
                    <div className="text-xs">Get it on</div>
                    <div className="text-base font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              {/* A smartphone displaying the UshopLS mobile app */}
              <img 
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="UshopLS Mobile App" 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppCTA;
