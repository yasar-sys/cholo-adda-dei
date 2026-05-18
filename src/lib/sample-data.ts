import a1 from "@/assets/avatar-1.jpg";
import a2 from "@/assets/avatar-2.jpg";
import a3 from "@/assets/avatar-3.jpg";
import sundarbans from "@/assets/post-sundarbans.jpg";
import rickshaw from "@/assets/post-rickshaw.jpg";
import biryani from "@/assets/post-biryani.jpg";

export type TrustLevel = "verified" | "suspicious" | "false";

export interface SamplePost {
  id: string;
  authorBn: string;
  authorEn: string;
  handle: string;
  avatar: string;
  timeBn: string;
  timeEn: string;
  contentBn: string;
  contentEn: string;
  image?: string;
  trust: TrustLevel;
  trustScore: number;
  likes: number;
  comments: number;
  shares: number;
}

export const samplePosts: SamplePost[] = [
  {
    id: "1",
    authorBn: "নুসরাত জাহান",
    authorEn: "Nusrat Jahan",
    handle: "@nusrat.j",
    avatar: a1,
    timeBn: "২ ঘণ্টা আগে",
    timeEn: "2 hours ago",
    contentBn: "সুন্দরবনের নতুন স্যাটেলাইট ছবিতে দেখা গেছে গত পাঁচ বছরে ম্যানগ্রোভ আবরণ ৩.২% বেড়েছে। আশা জাগানিয়া খবর! 🌿",
    contentEn: "New satellite imagery of the Sundarbans shows mangrove cover has grown by 3.2% over the last five years. Hopeful news! 🌿",
    image: sundarbans,
    trust: "verified",
    trustScore: 94,
    likes: 1284,
    comments: 142,
    shares: 89,
  },
  {
    id: "2",
    authorBn: "রাহাত হোসেন",
    authorEn: "Rahat Hossain",
    handle: "@rahat.dhk",
    avatar: a2,
    timeBn: "৫ ঘণ্টা আগে",
    timeEn: "5 hours ago",
    contentBn: "ঢাকার রিকশাচিত্র এখন ইউনেস্কোর অস্পৃশ্য সাংস্কৃতিক ঐতিহ্যের তালিকায়। শিল্পীদের জন্য ঐতিহাসিক মুহূর্ত। 🎨",
    contentEn: "Dhaka's rickshaw painting is now on UNESCO's intangible cultural heritage list. A historic moment for the artists. 🎨",
    image: rickshaw,
    trust: "verified",
    trustScore: 97,
    likes: 3210,
    comments: 410,
    shares: 612,
  },
  {
    id: "3",
    authorBn: "রহিমা বেগম",
    authorEn: "Rahima Begum",
    handle: "@rahima.kitchen",
    avatar: a3,
    timeBn: "১ দিন আগে",
    timeEn: "1 day ago",
    contentBn: "নানুর হাতের কাচ্চি বিরিয়ানি — গোপন রেসিপি প্রথমবার শেয়ার করছি। কমেন্টে জানান বানিয়েছেন কিনা! 🍛",
    contentEn: "Grandma's kacchi biryani — sharing the secret recipe for the first time. Let me know in comments if you try it! 🍛",
    image: biryani,
    trust: "verified",
    trustScore: 88,
    likes: 8943,
    comments: 1203,
    shares: 2104,
  },
  {
    id: "4",
    authorBn: "অজ্ঞাত পেজ",
    authorEn: "Unknown Page",
    handle: "@viralbd24",
    avatar: a2,
    timeBn: "৩ ঘণ্টা আগে",
    timeEn: "3 hours ago",
    contentBn: "ব্রেকিং: আগামীকাল থেকে দেশের সব স্কুল অনির্দিষ্টকালের জন্য বন্ধ ঘোষণা! শেয়ার করে সবাইকে জানান!",
    contentEn: "BREAKING: All schools across the country closed indefinitely starting tomorrow! Share to spread the word!",
    trust: "false",
    trustScore: 12,
    likes: 42,
    comments: 380,
    shares: 9,
  },
];

export const sampleStories = [
  { id: "s1", nameBn: "নুসরাত", nameEn: "Nusrat", avatar: a1 },
  { id: "s2", nameBn: "রাহাত",  nameEn: "Rahat",  avatar: a2 },
  { id: "s3", nameBn: "রহিমা",  nameEn: "Rahima", avatar: a3 },
  { id: "s4", nameBn: "আদিল",   nameEn: "Adil",   avatar: a2 },
  { id: "s5", nameBn: "তানিয়া", nameEn: "Tania",  avatar: a1 },
];

export const sampleChats = [
  { id: "c1", nameBn: "পরিবার গ্রুপ", nameEn: "Family Group", avatar: a3, lastBn: "আম্মু: রাতে আসছিস তো?", lastEn: "Mom: Coming home tonight?", time: "12:42", unread: 3, online: true },
  { id: "c2", nameBn: "নুসরাত জাহান", nameEn: "Nusrat Jahan",  avatar: a1, lastBn: "ছবিগুলো অসাধারণ হয়েছে! 📸", lastEn: "The photos turned out amazing! 📸", time: "11:08", unread: 1, online: true },
  { id: "c3", nameBn: "রাহাত হোসেন",  nameEn: "Rahat Hossain", avatar: a2, lastBn: "আজ অফিসে দেখা হবে?", lastEn: "See you at the office today?", time: "যেস্টার্ডে", unread: 0, online: false },
  { id: "c4", nameBn: "BUET ব্যাচ ২২", nameEn: "BUET Batch 22", avatar: a2, lastBn: "আদিল: প্রজেক্ট জমা কাল", lastEn: "Adil: Project due tomorrow", time: "Yesterday", unread: 0, online: false },
];
