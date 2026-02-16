import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
   <main>
     <h1>Welcome to Huddle</h1>
     <div>
       <Link href="/register">Register</Link>
       <Link href="/login">Login</Link>
     </div>
   </main>
  );
}
