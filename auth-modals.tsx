import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

interface AuthModalsProps {
  showModal: "login" | "signup" | null;
  onClose: () => void;
}

export default function AuthModals({ showModal, onClose }: AuthModalsProps) {
  const isOpen = showModal !== null;
  const activeTab = showModal || "login";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {activeTab === "login" ? "Welcome back" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "login" 
              ? "Sign in to your Signhey account" 
              : "Join Signhey to start signing documents today"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} className="w-full" value={activeTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger 
              value="login" 
              onClick={() => showModal === "signup" && onClose()}
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              onClick={() => showModal === "login" && onClose()}
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onComplete={onClose} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm onComplete={onClose} />
          </TabsContent>
        </Tabs>
        
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm bg-white hover:bg-slate-50 text-sm font-medium text-slate-700">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.309.678.919.678 1.852 0 1.337-.012 2.416-.012 2.744 0 .267.18.578.688.48C17.14 18.163 20 14.42 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
            </svg>
            GitHub
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm bg-white hover:bg-slate-50 text-sm font-medium text-slate-700">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
            </svg>
            Twitter
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
