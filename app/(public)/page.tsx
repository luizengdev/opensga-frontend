import {CoursesSection} from "@/components/public/courses-section";
import {CtaBanner} from "@/components/public/cta-banner";
import {DiferenciaisSection} from "@/components/public/diferenciais-section";
import {HeroCarousel} from "@/components/public/hero-carousel";
import {InstitutionalSection} from "@/components/public/institutional-section";
import {StudentShowcase} from "@/components/public/student-showcase";

const HomePage = () => {
  return (
    <>
      <HeroCarousel />
      <DiferenciaisSection />
      <CoursesSection />
      <InstitutionalSection />
      <StudentShowcase />
      <CtaBanner />
    </>
  );
};

export default HomePage;
