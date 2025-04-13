// src/pages/ProfilePage.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const ProfilePage = () => {
  return (
    <div >
      {/* Navbar */}
      <Navbar />
        {/* Profile Page Content */}    

        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
            <p className="text-gray-700">Welcome to your profile page!</p>
            {/* Add more profile-related content here */}
        </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;