import { useWedding, useStoryItems } from "@/react-app/contexts/WeddingContext";
import { Heart, BookOpen, Calendar } from "lucide-react";

export default function DynamicStory() {
  const { theme, wedding } = useWedding();
  const storyItems = useStoryItems();

  // Check if section should be shown
  if (wedding.show_story === 0) {
    return null;
  }

  // Check if there's a custom story text
  const hasCustomStory = wedding.our_story && wedding.our_story.trim().length > 0;
  // Check if there are story items
  const hasStoryItems = storyItems && storyItems.length > 0;

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section 
      className="py-20 md:py-32 px-4"
      style={{ backgroundColor: theme.background, fontFamily: theme.bodyFont }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p 
            className="text-sm uppercase tracking-[0.2em] mb-4"
            style={{ color: theme.primary }}
          >
            Nossa Jornada
          </p>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{ fontFamily: theme.headingFont, color: theme.text }}
          >
            Nossa História
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
            <Heart className="w-5 h-5" style={{ color: theme.primary }} />
            <div className="h-px w-16" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>

        {hasStoryItems ? (
          /* Story items from database */
          <div className="space-y-12">
            {storyItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-5/12">
                  <div 
                    className="relative overflow-hidden rounded-2xl shadow-xl"
                    style={{ border: `2px solid ${theme.accent}` }}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div 
                        className="w-full h-64 md:h-80 flex items-center justify-center"
                        style={{ backgroundColor: theme.secondary }}
                      >
                        <Heart className="w-16 h-16" style={{ color: `${theme.primary}40` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className={`w-full md:w-7/12 text-center ${index % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                  {item.story_date && (
                    <p 
                      className="text-sm font-medium uppercase tracking-wider mb-2 flex items-center gap-2"
                      style={{ 
                        color: theme.primary,
                        justifyContent: index % 2 === 0 ? "flex-start" : "flex-end"
                      }}
                    >
                      <Calendar className="w-4 h-4" />
                      {formatDate(item.story_date)}
                    </p>
                  )}
                  <h3 
                    className="text-2xl md:text-3xl mb-4"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="whitespace-pre-wrap" style={{ color: `${theme.text}99` }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : hasCustomStory ? (
          /* Custom Story text from wedding data */
          <div 
            className="p-8 md:p-12 rounded-3xl"
            style={{ backgroundColor: theme.secondary }}
          >
            <div className="flex justify-center mb-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}20` }}
              >
                <BookOpen className="w-8 h-8" style={{ color: theme.primary }} />
              </div>
            </div>
            <div 
              className="prose prose-lg max-w-none text-center leading-relaxed whitespace-pre-wrap"
              style={{ color: theme.text }}
            >
              {wedding.our_story}
            </div>
          </div>
        ) : (
          /* Default placeholder story */
          <div className="space-y-12">
            {[
              {
                date: "O Começo",
                title: "Quando Nos Conhecemos",
                description: "Cada grande história de amor tem um começo especial. A nossa não foi diferente...",
                image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
              },
              {
                date: "O Meio",
                title: "Construindo Juntos",
                description: "Dias se tornaram meses, meses se tornaram anos. E a cada momento, nosso amor cresceu...",
                image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=300&fit=crop",
              },
              {
                date: "E Agora",
                title: "O Grande Sim",
                description: "E aqui estamos, prestes a dar o próximo passo nessa jornada maravilhosa juntos.",
                image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop",
              },
            ].map((event, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-5/12">
                  <div 
                    className="relative overflow-hidden rounded-2xl shadow-xl"
                    style={{ border: `2px solid ${theme.accent}` }}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`w-full md:w-7/12 text-center ${index % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                  <p 
                    className="text-sm font-medium uppercase tracking-wider mb-2"
                    style={{ color: theme.primary }}
                  >
                    {event.date}
                  </p>
                  <h3 
                    className="text-2xl md:text-3xl mb-4"
                    style={{ fontFamily: theme.headingFont, color: theme.text }}
                  >
                    {event.title}
                  </h3>
                  <p style={{ color: `${theme.text}99` }}>
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
            
            <p className="text-center text-sm opacity-60 mt-8" style={{ color: theme.text }}>
              Em breve os noivos compartilharão sua história completa
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
