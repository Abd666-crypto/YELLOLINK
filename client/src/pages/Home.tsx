import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, MapPin, Car, Coins, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 py-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            <span className="yelo-text-gradient">YeloLink</span> <br/>
            <span className="text-3xl md:text-5xl">Tamale&apos;s Ride-Sharing Revolution</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Secure, affordable, and blockchain-powered rides with mobile money payments in Tamale, Ghana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="yelo-gradient">
              <Link href="/rider-request">
                Request a Ride <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/driver-register">
                Become a Driver <Car className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 rounded-xl overflow-hidden shadow-2xl ghana-flag-border">
          <div className="w-full h-80 md:h-96 bg-accent/10 flex items-center justify-center">
            <div className="text-7xl font-bold yelo-text-gradient">
              <MapPin className="h-32 w-32 mx-auto mb-4" />
              <span>Tamale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose YeloLink?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" /> Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Blockchain-powered ride verification and tracking ensures safety and transparency for both drivers and riders.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-secondary" /> MoMo Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Easy mobile money payments integration with trusted escrow system for secure transactions.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-6 w-6 text-accent" /> Local Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our drivers are all local to Tamale, familiar with every corner of the city and committed to excellent service.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12">
        <Card className="yelo-gradient text-white">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Ready to Experience YeloLink?</CardTitle>
            <CardDescription className="text-white/80">
              Join the future of transportation in Tamale today.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="secondary" size="lg">
              <Link href="/rider-request">
                Book Your First Ride
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}