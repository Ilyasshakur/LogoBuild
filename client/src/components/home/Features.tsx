import { Truck, ShieldCheck, RotateCcw, Users } from "lucide-react";

const FeatureItem = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="text-primary text-xl" size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Across Lesotho's major cities"
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "Mpesa, Ecocash & more"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "7-day return policy"
    },
    {
      icon: Users,
      title: "Local Support",
      description: "Chat or call with our team"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
