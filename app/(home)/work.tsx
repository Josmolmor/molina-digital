import { Separator } from '@/components/ui/separator';
import timelineItems from '@/data/timeline';

const WorkPage = () => {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="work" className="font-medium text-2xl font-serif">
        Work
      </h2>
      <Separator />
      <div className="flex flex-col gap-2 -mx-5">
        {timelineItems.map((item) => (
          <div
            key={item.id}
            className="relative flex gap-4 hover:bg-card active:bg-card pt-4 pb-5 px-5 rounded-2xl transition-[background-color] motion-reduce:transition-none"
          >
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex gap-2 items-center justify-between">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="after:absolute after:inset-0 after:rounded-2xl"
                >
                  {item.title}
                </a>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.date}
                </span>
              </div>
              <div className="text-muted-foreground flex flex-col gap-1">
                {item.description}
                {item.title === 'LottieFiles' && (
                  <>
                    <Separator className="my-3 w-6" />
                    <div className="flex flex-wrap items-center">
                      <span>Currently working on the</span>
                      <a
                        href="https://creator.lottiefiles.com?utm_source=molina.digital&utm_medium=referral"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-0.5 relative z-10 text-primary font-medium hover:underline shrink-0 ml-1 mr-px"
                      >
                        Creator
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-5 mr-1 shrink-0"
                        >
                          <path
                            className="origin-center group-hover:animate-[cursor-swoop_750ms_cubic-bezier(0.65,0.05,0.36,1)_1] motion-reduce:animate-none"
                            d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"
                          />
                          <path d="M5 17A12 12 0 0 1 17 5" />
                          <circle cx="19" cy="5" r="2" />
                          <circle cx="5" cy="19" r="2" />
                        </svg>
                      </a>
                      <span>app</span>
                    </div>
                  </>
                )}
                {item.recommendationLink && (
                  <>
                    <Separator className="my-3 w-6" />
                    <a
                      href={item.recommendationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit group relative"
                    >
                      <span className="text-primary font-medium">
                        Recommendation Letters
                      </span>
                      <span className="rounded absolute bottom-0 left-0 h-0.5 w-full origin-bottom-right scale-x-0 bg-primary transition-transform ease-out-quad group-hover:origin-bottom-left group-hover:scale-x-100" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkPage;
