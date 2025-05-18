import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const SellerCTA = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    category: "",
    agreedToTerms: false,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreedToTerms: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast({
        title: "Terms and Conditions",
        description: "You must agree to the Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call an API to register a seller
    toast({
      title: "Registration Submitted",
      description: "Thank you for your interest! We'll review your application soon.",
    });
    
    // Reset form
    setFormData({
      businessName: "",
      email: "",
      phone: "",
      category: "",
      agreedToTerms: false,
    });
  };

  return (
    <section className="py-12 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Become a Seller on UshopLS
            </h2>
            <p className="text-lg mb-6">
              Reach thousands of customers across Lesotho. Join the growing
              community of local businesses thriving online.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="mr-3 text-secondary h-5 w-5" />
                <span>Free registration for all local businesses</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 text-secondary h-5 w-5" />
                <span>Powerful tools to manage your shop</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 text-secondary h-5 w-5" />
                <span>Secure payments directly to your account</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-3 text-secondary h-5 w-5" />
                <span>Support at every step</span>
              </li>
            </ul>
            <Link href="/seller/register">
              <Button className="bg-white hover:bg-neutral-100 text-primary font-medium py-3 px-6 h-auto rounded-md transition duration-200">
                Start Selling Today
              </Button>
            </Link>
          </div>
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="bg-white rounded-lg p-6 text-neutral-800 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Register as a Seller</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Your business name"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+266 xxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fashion">Fashion & Clothing</SelectItem>
                        <SelectItem value="crafts">Crafts & Handmade</SelectItem>
                        <SelectItem value="food">Food & Grocery</SelectItem>
                        <SelectItem value="home">Home & Furniture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-neutral-700 cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link href="/terms">
                        <a className="text-primary hover:underline">
                          Terms and Conditions
                        </a>
                      </Link>
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    Register Now
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
