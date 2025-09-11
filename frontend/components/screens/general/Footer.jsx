import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div className="bg-[#1e1e20] px-6 ">
      <div className="flex flex-wrap justify-between items-center py-10 border-b border-gray-400">
        <h1 className="hidden sm:block">
          <Link href="#">
            <div className="flex items-center">
              <div className="logo text-white text-3xl border border-white p-2">Eventify</div>
            </div>
          </Link>
        </h1>
        <ul className="flex justify-between w-full sm:w-max sm:flex-col md:flex lg:flex-row lg:gap-10 gap-8 sm:gap-3 text-white font-bold">
          <li className="sm:text-center text-xs sm:text-lg">Terms & Conditions</li>
          <li className="sm:text-center text-xs sm:text-lg">Privacy Policy</li>
          <li className="sm:text-center text-xs sm:text-lg">Contact Us</li>
        </ul>
        <div className="w-24 overflow-hidden rounded-sm hidden sm:block">
          <img src="/localQr.png" alt="" />
        </div>
      </div>
      <div className="flex justify-between items-center py-5 pb-24 flex-wrap lg:flex-nowrap">
        <p className="text-gray-400 text-sm w-full leading-6 text-center md:text-left">
          By accessing this page, you confirm that you have read, understood,
          and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and
          Content Guidelines. All rights reserved.
        </p>
        <ul className="flex gap-4 justify-center items-center mt-5 w-full lg:justify-end">
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
