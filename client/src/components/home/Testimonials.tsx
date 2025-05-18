import { User } from "lucide-react";

interface TestimonialProps {
  quote: string;
  name: string;
  business: string;
  initial: string;
  bgColor: string;
}

const Testimonial = ({ quote, name, business, initial, bgColor }: TestimonialProps) => {
  return (
    <div className="bg-neutral-100 rounded-lg p-6 relative">
      <div className="text-primary text-4xl absolute -top-5 left-6">"</div>
      <p className="text-neutral-700 mb-6 pt-4">{quote}</p>
      <div className="flex items-center">
        <div className={`w-12 h-12 ${bgColor} rounded-full mr-4 flex items-center justify-center text-white font-bold`}>
          {initial}
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-neutral-500 text-sm">{business}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Since joining UshopLS, my customer base has tripled. The platform is so easy to use and the support team is always ready to help. I can now reach customers across Lesotho!",
      name: "Thabo Mokoena",
      business: "Maseru Electronics",
      initial: "TM",
      bgColor: "bg-primary"
    },
    {
      quote: "As a small artisan shop, I never thought I could sell online. UshopLS made it possible and now my traditional crafts reach tourists and locals alike. My sales have increased by 70%!",
      name: "Lineo Phaloane",
      business: "Highland Crafts",
      initial: "LP",
      bgColor: "bg-secondary"
    },
    {
      quote: "The secure payment system on UshopLS gave my customers confidence to shop online. Now I manage my fashion business right from my phone and receive payments instantly!",
      name: "Karabo Ramonotsi",
      business: "Urban Styles Clothing",
      initial: "KR",
      bgColor: "bg-neutral-700"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
            What Our Sellers Say
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Hear from the local business owners who have grown their businesses with UshopLS
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              name={testimonial.name}
              business={testimonial.business}
              initial={testimonial.initial}
              bgColor={testimonial.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
