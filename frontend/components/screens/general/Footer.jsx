import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div className="bg-[#1e1e20] px-6 ">
      <div className="flex justify-between items-center py-10 border-b border-gray-400">
        <h1>
          <Link href="/">
            <div className="flex items-center">
              <div className="logo text-white text-3xl border border-white p-2">Eventify</div>
            </div>
          </Link>
        </h1>
        <ul className="flex gap-8 font-bold text-white">
          <li>Terms & Conditions</li>
          <li>Privacy Policy</li>
          <li>Contact Us</li>
        </ul>
        <div className="w-24 overflow-hidden rounded-sm">
          <img src="/localQr.png" alt="" />
        </div>
      </div>
      <div className="flex justify-between items-center py-5 pb-24">
        <p className="text-gray-400 text-sm w-[60%] leading-6">
          By accessing this page, you confirm that you have read, understood,
          and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and
          Content Guidelines. All rights reserved.
        </p>
        <ul className="flex gap-4 items-center">
            <Link href="" className="w-6"><img src="/whatsapp.svg" alt="" className="block w-full" /></Link>
            <Link href="" className="w-6"><img src="/x.svg" alt="" className="block w-full" /></Link>
            <Link href="" className="w-6"><img src="/youtube.svg" alt="" className="block w-full" /></Link>
            <Link href="" className="w-6"><img src="/facebook.svg" alt="" className="block w-full" /></Link>
            <Link href="" className="w-6"><img src="/instagram.svg" alt="" className="block w-full" /></Link>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
