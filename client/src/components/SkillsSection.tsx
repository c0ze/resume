import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../translations";

interface TechnicalSkill {
  name: string;
  level: number;
}

interface Tag {
  name: string;
}

// Define static technical skills (only the levels really matter here)
const technicalSkills: TechnicalSkill[] = [
  { name: "JavaScript/TypeScript", level: 95 },
  { name: "React", level: 90 },
  { name: "HTML5/CSS3", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Redux", level: 85 }
];

const SkillsSection = () => {
  const { language } = useLanguage();
  const t = getTranslation(language);

  // Parse tech stack items from translations
  const techStackItems = t.skills.techStackItems.split(", ").map((item: string) => ({ name: item.trim() }));
  
  // Parse soft skills from translations
  const softSkillItems = t.skills.softSkillItems.split(", ").map((item: string) => ({ name: item.trim() }));

  return (
    <section id="skills" className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{t.skills.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">{t.skills.technicalSkills}</h3>
            
            {technicalSkills.map((skill, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span>{skill.level}%</span>
                </div>
                <div className="h-2">
                  <Progress value={skill.level} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Other Skills</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold mb-2">{t.skills.techStack}</h4>
              <div className="flex flex-wrap gap-2">
                {techStackItems.map((tech: Tag, index: number) => (
                  <span key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t.skills.softSkills}</h4>
              <div className="flex flex-wrap gap-2">
                {softSkillItems.map((skill: Tag, index: number) => (
                  <span key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SkillsSection;
