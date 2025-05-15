const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-primary text-white py-6 px-4 md:px-8 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p>&copy; {new Date().getFullYear()} Arda Karaduman. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={scrollToTop}
              className="text-white hover:text-blue-300 transition-colors"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
