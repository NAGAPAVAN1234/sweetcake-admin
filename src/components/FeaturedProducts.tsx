
import { Card } from "@/components/ui/card";

const products = [
  {
    id: 1,
    name: "Classic Chocolate",
    description: "Rich chocolate layers with ganache",
    price: "$45",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Vanilla Dream",
    description: "Light vanilla sponge with buttercream",
    price: "$40",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Berry Bliss",
    description: "Fresh berries with cream cheese frosting",
    price: "$50",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Our Most Popular Cakes
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Discover our most beloved creations, each made with premium ingredients
            and decorated with loving attention to detail.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-up"
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary-foreground mb-2">
                  {product.name}
                </h3>
                <p className="text-primary-foreground/70 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-accent font-bold">{product.price}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
