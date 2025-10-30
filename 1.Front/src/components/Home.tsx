import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useNavigate } from "react-router-dom";
import Ribbons from "./ui/Ribbons";

export function BackgroundBeamsWithCollisionDemo() {

  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/room');
  }
  
  return (
    <>
      <div className="w-full h-[90px] bg-gray-950 text-amber-50 flex items-center">
        <p className="text-fuchsia-700 text-4xl font-bold ml-6">TypeRival</p>

        {/* <button className="p-[3px] relative text-fuchsia-700 text-2xl ml-[1100px] cursor-pointer btn">
          {" "}
          Login{" "}
        </button>
        <button className="p-[3px] relative ml-6 cursor-pointer">
          <div className="absolute inset-0 bg-linear-to-r from-fuchsia-700 to-purple-500 rounded-lg" />
          <div className="px-8 py-2  bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
            Sign Up
          </div>
        </button> */}
      </div>
      <div>
        <BackgroundBeamsWithCollision>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-white font-sans tracking-tight leading-tight">
              What&apos;s cooler than Games?{" "}
              <div className="relative mx-auto inline-block w-max filter-[drop-shadow(0px_1px_3px_rgba(27,37,80,0.14))]">
                <div className="relative bg-clip-text text-transparent bg-no-repeat bg-linear-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
                  <span className="">Typing games.</span>
                </div>
              </div>
            </h2>
            <button type="submit" onClick={handleSubmit} className="shine-btn mt-8 z-20 cursor-pointer">
              Start Playing
            </button>
          </div>
        </BackgroundBeamsWithCollision>

        <div className="h-[87.7vh] w-full relative overflow-hidden flex items-center justify-center">
          <Ribbons
            baseThickness={10}
            colors={["#8B5CF6", "#FF00FF"]}
            speedMultiplier={0.5}
            maxAge={500}
            enableFade={false}
            enableShaderEffect={true}
          />
        </div>
      </div>
    </>
  );
}
export default BackgroundBeamsWithCollisionDemo;
