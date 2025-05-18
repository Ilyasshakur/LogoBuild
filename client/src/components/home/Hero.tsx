import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative bg-primary text-white">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div 
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center" 
        style={{ backgroundImage: "url('https://pixabay.com/get/gc32fa7606894fa6229dde680e745425f4e8c87da64d58466488cfcbc4a5b07fd1397d77c66a74c3f4d45bd2cbb0b6cb9d809392f83c555ccb8b2b344b293f237_1280.jpg')" }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              UshopLS – Your Local Market, Online.
            </h1>
            <p className="text-lg mb-8">
              Discover the best products from local businesses across Lesotho, all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button className="bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 h-auto rounded-md transition duration-200">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/seller/register">
                <Button className="bg-white hover:bg-neutral-100 text-primary font-medium py-3 px-6 h-auto rounded-md transition duration-200">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
