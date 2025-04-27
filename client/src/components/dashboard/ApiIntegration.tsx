import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiIntegration() {
  const [showProdKey, setShowProdKey] = useState(false);
  const [showDevKey, setShowDevKey] = useState(false);
  const { toast } = useToast();
  
  // In a real app, these would be fetched from an API
  const prodKey = "sk_live_51KjT9HJTXn6lNZtXlS9Rl5KiTmD2f2EQjv4aYJhw";
  const devKey = "sk_test_51KjT9HJTXn6lNZtXlS9Rl5KiTmC1f1DPiu3bXgi";
  
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return "••••••••••••";
    return "••••••••••••••••••••••••••••" + key.slice(-4);
  };
  
  const handleCopyCode = () => {
    const code = document.getElementById("integration-code")?.textContent;
    if (code) {
      navigator.clipboard.writeText(code);
      toast({
        title: "Code copied!",
        description: "The integration code has been copied to your clipboard.",
      });
    }
  };
  
  const handleCopyKey = (key: string, type: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: `${type} key copied!`,
      description: `The ${type.toLowerCase()} API key has been copied to your clipboard.`,
    });
  };
  
  const handleRegenerateKey = (type: string) => {
    // In a real app, this would make an API call to regenerate the key
    toast({
      title: `${type} key regeneration requested`,
      description: `Your ${type.toLowerCase()} API key regeneration has been initiated.`,
    });
  };
  
  const handleCreateNewKey = () => {
    // In a real app, this would open a modal to create a new key
    toast({
      title: "New API key",
      description: "Creating a new API key functionality would open a modal here.",
    });
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-secondary-900">API Integration</h3>
        <a href="/api-docs" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View documentation
        </a>
      </div>
      
      <div className="p-6 mt-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Integration Code */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-secondary-900">Integration Code</h4>
            <div className="p-4 font-mono text-xs rounded-md bg-secondary-800 text-secondary-100">
              <pre id="integration-code" className="whitespace-pre-wrap">
{`import datascrapehub

# Initialize client
client = datascrapehub.Client(
    api_key="YOUR_API_KEY"
)

# Create a new scraper
scraper = client.create_scraper(
    name="Product Monitor",
    url="https://example.com/products",
    selector=".product-item",
    fields={
        "name": ".product-name",
        "price": ".product-price",
        "image": ".product-image img[src]"
    }
)

# Run the scraper
results = scraper.run()
print(f"Collected {len(results)} products")`}
              </pre>
            </div>
            <div className="mt-4">
              <Button onClick={handleCopyCode}>
                <Copy size={16} className="mr-2" />
                Copy Code
              </Button>
            </div>
          </div>
          
          {/* API Keys */}
          <div>
            <h4 className="mb-4 text-sm font-medium text-secondary-900">Your API Keys</h4>
            <div className="mb-4 overflow-hidden border border-secondary-300 rounded-md shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-secondary-900">Production API Key</h5>
                    <div className="flex items-center mt-1">
                      <div className="px-3 py-1 text-xs font-medium tracking-wider rounded bg-secondary-100 text-secondary-800">
                        {showProdKey ? prodKey : maskApiKey(prodKey)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 ml-2 text-secondary-400 hover:text-secondary-500"
                        onClick={() => setShowProdKey(!showProdKey)}
                      >
                        {showProdKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 ml-1 text-secondary-400 hover:text-secondary-500"
                        onClick={() => handleCopyKey(prodKey, "Production")}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRegenerateKey("Production")}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-hidden border border-secondary-300 rounded-md shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-secondary-900">Development API Key</h5>
                    <div className="flex items-center mt-1">
                      <div className="px-3 py-1 text-xs font-medium tracking-wider rounded bg-secondary-100 text-secondary-800">
                        {showDevKey ? devKey : maskApiKey(devKey)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 ml-2 text-secondary-400 hover:text-secondary-500"
                        onClick={() => setShowDevKey(!showDevKey)}
                      >
                        {showDevKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 ml-1 text-secondary-400 hover:text-secondary-500"
                        onClick={() => handleCopyKey(devKey, "Development")}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRegenerateKey("Development")}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={handleCreateNewKey}>
                <Copy size={16} className="mr-2" />
                Create New API Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
