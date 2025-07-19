import React from "react";

const blogPosts = [
  {
    id: 1,
    title: "5 Tips to Save Money on Daily Commute",
    date: "July 15, 2025",
    image: "/images/blog1.jpg", // Replace with your image path
    summary:
      "Looking to cut down travel costs? Here are 5 actionable tips to help you save money while using ride-sharing services daily.",
  },
  {
    id: 2,
    title: "How Technology is Changing Urban Transport",
    date: "July 10, 2025",
    image: "/images/blog2.jpg",
    summary:
      "From AI to electric vehicles, discover how modern tech is transforming the way we commute in cities.",
  },
  {
    id: 3,
    title: "Top 3 Benefits of Using Bike Taxis",
    date: "July 3, 2025",
    image: "/images/blog3.jpg",
    summary:
      "Explore the key benefits of choosing a bike taxi for short trips – it's fast, affordable, and eco-friendly!",
  },
];

const Blog = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Latest Blog Posts
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">{post.date}</p>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-4">{post.summary}</p>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
