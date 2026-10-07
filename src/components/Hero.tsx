/** @format */

const Hero = () => (
  <section className="relative isolate flex h-[70vh] items-end overflow-hidden bg-[#120f17] px-4 pb-12 sm:px-8">
    <div className="absolute inset-0 -z-10">
      lineColor="#4e4967" glowColor="#1f202e" speed={0.2}
      scale={2}
      rotation={0}
      rotationSpeed={0.25}
      layers={4}
      waveAmplitude={0.015}
      waveFrequency={3}
      waveSpeed={-1.55}
      layerSpeed={0.08}
      twist={0.1}
      twistFrequency={1.4}
      twistSpeed={1.2}
      lineFrequency={5}
      lineSpacing={0.6}
      lineSharpness={16}
      glowFalloff={10}
      glowIntensity={0.24}
      brightness={1.65}
      blueBoost={1.17}
      vignette={0.72}
      grain={0.05}
      dpr={1}
      fps={30}
    </div>
    <h1 className="text-4xl font-semibold text-white sm:text-6xl">
      Designer Name
    </h1>
  </section>
);

export default Hero;
