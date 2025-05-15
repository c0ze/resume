import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AtSign, MapPinIcon, GlobeIcon, DownloadIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

const ContactSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  const handleDownloadResume = () => {
    // Download the resume based on the selected language
    let resumePath;
    if (language === 'en') {
      resumePath = '/resume.pdf';
    } else if (language === 'ja') {
      resumePath = '/resume-ja.pdf';
    } else if (language === 'tr') {
      resumePath = '/resume-tr.pdf';
    }

    // Add a timestamp to prevent caching
    resumePath = `${resumePath}?t=${Date.now()}`;
    
    // For debugging
    console.log(`Downloading resume from ContactSection for language: ${language}, path: ${resumePath}`);
    
    // Open in a new tab
    window.open(resumePath, '_blank');
  };

  return (
    <section id="contact" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.contact.title}</h2>
      
      <Card>
        <CardContent className="p-6">
          <div className="md:flex">
            <div className="md:w-1/2 md:pr-4">
              <h3 className="text-xl font-bold mb-4">{t.contact.getInTouch}</h3>
              <p className="mb-6">Feel free to reach out for collaboration opportunities, job inquiries, or just to say hello!</p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                    <AtSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <button 
                      onClick={() => window.location.href = 'mailto:me@arda.karaduman.web.tr'} 
                      className="text-blue-500 hover:underline"
                    >
                      {t.contact.emailMe}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                    <MapPinIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{t.about.location}</p>
                    <p>{t.header.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-4">
                    <GlobeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href="https://arda.karaduman.web.tr" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline"
                    >
                      arda.karaduman.web.tr
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:w-1/2 md:pl-4">
              <h3 className="text-xl font-bold mb-4">{t.contact.findMeOn}</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="GitHub Profile"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center hover:bg-blue-300 transition-colors"
                  aria-label="Twitter Profile"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                </a>
                <a 
                  href="https://medium.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                  aria-label="Medium Profile"
                >
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"></path>
                  </svg>
                </a>
              </div>
              
              <div className="mt-8">
                <p className="font-medium mb-2">{t.header.downloadResume}</p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleDownloadResume}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  {t.header.downloadResume}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ContactSection;
