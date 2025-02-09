
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-primary-foreground text-center mb-8">
            About Sweet Delights
          </h1>
          <div className="bg-white/80 backdrop-blur-lg rounded-lg p-8 shadow-lg">
            <div className="prose prose-lg mx-auto">
              <p className="mb-6">
                Welcome to Sweet Delights, where passion meets perfection in every
                bite. Our journey began with a simple love for creating delicious,
                handcrafted cakes that bring joy to special moments in people's
                lives.
              </p>
              <p className="mb-6">
                Each cake we create is a masterpiece, carefully crafted using only
                the finest ingredients and decorated with meticulous attention to
                detail. Our team of skilled pastry chefs combines traditional
                baking techniques with innovative designs to create cakes that are
                not only delicious but also visually stunning.
              </p>
              <p className="mb-6">
                We take pride in being part of your celebrations, whether it's a
                wedding, birthday, anniversary, or any special occasion. Our
                commitment to quality and customer satisfaction has made us a
                trusted name in the community.
              </p>
              <h2 className="text-2xl font-bold mb-4">Our Values</h2>
              <ul className="list-disc pl-6 mb-6">
                <li>Quality ingredients in every recipe</li>
                <li>Handcrafted with attention to detail</li>
                <li>Customer satisfaction is our priority</li>
                <li>Innovation in flavors and designs</li>
                <li>Support for local suppliers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
