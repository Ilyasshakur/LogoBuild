import { Link } from "wouter";
import Logo from "@/components/common/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Send,
  MessageCircle,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white text-primary rounded flex items-center justify-center">
                <Logo />
              </div>
              <span className="text-2xl font-heading font-bold text-white">UshopLS</span>
              <span className="text-sm text-neutral-400 block">Lesotho's Own Marketplace</span>
            </div>
            <p className="text-neutral-400 mb-6">
              Lesotho's premier online marketplace connecting local businesses with customers nationwide.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/ushopls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-secondary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-secondary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white hover:text-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Browse Categories
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/seller/register">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Sell on UshopLS
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Shipping Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/return-policy">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Return Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/account">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    My Account
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/orders/track">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Track My Order
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Help Center
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/report">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    Report a Product
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-neutral-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-secondary" size={18} />
                <span className="text-neutral-400">
                  Room 188 Metcash Complex, Maseru, Lesotho
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-secondary" size={18} />
                <span className="text-neutral-400">+266 62626266</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-secondary" size={18} />
                <span className="text-neutral-400">ushopls@info.com</span>
              </li>
              <li className="flex items-center">
                <MessageCircle className="mr-3 text-secondary" size={18} />
                <a 
                  href="https://wa.me/26662626266" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">
                Subscribe to our newsletter
              </h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-md bg-neutral-700 border border-neutral-600 text-white focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <Button className="bg-secondary hover:bg-secondary-dark text-white px-4 rounded-r-md transition">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-neutral-700 my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} UshopLS. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center space-x-4">
            <Link href="/terms">
              <a className="text-neutral-500 hover:text-white text-sm transition-colors">
                Terms & Conditions
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-neutral-500 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
            </Link>
            <Link href="/cookies">
              <a className="text-neutral-500 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
