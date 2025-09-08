import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} UGS Healthcare. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#features" className="hover:text-white transition">
            Features
          </Link>
          <Link href="#about" className="hover:text-white transition">
            About
          </Link>
          <Link href="/auth/login" className="hover:text-white transition">
            Login
          </Link>
          <Link href="/auth/register" className="hover:text-white transition">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
