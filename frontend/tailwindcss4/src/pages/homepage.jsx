import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Header Section */}
            <header>
                <Navbar />
            </header>

            {/* Main Content Section */}
            <main className="flex-1 flex items-center justify-center text-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-2/3 md:w-1/2">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">We'll Be Back Soon!</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Our website is currently undergoing scheduled maintenance. We apologize for the inconvenience.
                    </p>
                    <p className="text-sm text-gray-500">
                        Please check back later or contact us at <a href="janatha@gmail.com" className="text-blue-500">janatha@gmail.com</a> for further assistance.
                    </p>
                </div>
            </main>

            {/* Footer Section */}
            <Footer />
        </div>
    );
}

export default MaintenancePage;
