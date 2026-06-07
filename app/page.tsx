
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {

 
  return (
    <div className="h-screen grid place-items-center">
      <Button variant={"secondary"}>
        <Link href="/login">Login</Link>
      </Button>    
    </div>
  );
}
