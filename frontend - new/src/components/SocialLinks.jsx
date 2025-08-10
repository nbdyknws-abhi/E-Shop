import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGithub,
} from "react-icons/fa";

const SocialLinks = ({ variant = "horizontal", size = "medium" }) => {
  const socialData = [
    {
      name: "Facebook",
      icon: FaFacebook,
      url: "https://facebook.com/choppertown",
      color: "text-blue-600 hover:text-blue-800",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: "https://twitter.com/choppertown",
      color: "text-blue-400 hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://instagram.com/choppertown",
      color: "text-pink-600 hover:text-pink-800",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: "https://linkedin.com/company/choppertown",
      color: "text-blue-700 hover:text-blue-900",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      url: "https://youtube.com/@choppertown",
      color: "text-red-600 hover:text-red-800",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      url: "https://github.com/nbdyknws-abhi",
      color: "text-gray-800 hover:text-gray-900",
    },
  ];

  const sizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl",
  };

  const containerClasses =
    variant === "horizontal"
      ? "flex items-center space-x-4"
      : "flex flex-col space-y-4";

  return (
    <div className={containerClasses}>
      {socialData.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${social.color} ${sizeClasses[size]} transition-colors duration-300 hover:scale-110 transform`}
            aria-label={`Follow us on ${social.name}`}
            title={`Follow us on ${social.name}`}
          >
            <IconComponent />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
