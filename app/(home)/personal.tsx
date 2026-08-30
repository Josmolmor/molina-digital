import { HoverBlob } from '@/components/ui/hover-blob';
import { PawPrintIcon } from '@/components/ui/icons/paw-print';
import { PlantIcon } from '@/components/ui/icons/plant';
import { Separator } from '@/components/ui/separator';

const PersonalPage = () => {
  return (
    <section className="flex flex-col gap-8">
      <h2 id="personal" className="font-medium text-2xl font-serif">
        Personal
      </h2>
      <Separator />
      <div className="text-pretty">
        <span>On the side, I like to cook, take care of </span>
        <HoverBlob
          className="text-emerald-600 dark:text-emerald-500"
          imageContent={
            <img
              loading="lazy"
              src="/assets/images/plants.jpg"
              alt="A photo of my plants in the balcony"
              className="rounded-lg absolute -top-84 h-80 left-1/2 -translate-x-1/2 object-cover w-auto ring-6 ring-card drop-shadow-lg"
            />
          }
          message="Just a few of them in the balcony"
        >
          my plants{' '}
          <PlantIcon className="inline-block size-5 shrink-0 -rotate-12 mb-0.5 -mt-0.5" />{' '}
        </HoverBlob>
        <span>
          make sure{' '}
          <HoverBlob
            className="text-indigo-600 dark:text-indigo-500"
            imageContent={
              <img
                loading="lazy"
                src="/assets/images/dog.jpg"
                alt="A photo of my dog Balu"
                className="rounded-lg absolute -top-64 h-60 left-1/2 -translate-x-1/2 object-cover w-auto ring-6 ring-card drop-shadow-lg "
              />
            }
            message="Meet the owner of the house"
          >
            Balu{' '}
            <PawPrintIcon className="inline-block size-5 shrink-0 rotate-12 mb-0.5 -mt-0.5" />{' '}
            is spoiled
          </HoverBlob>
        </span>
        <span>, play games, and do logo design.</span>
      </div>
    </section>
  );
};

export default PersonalPage;
