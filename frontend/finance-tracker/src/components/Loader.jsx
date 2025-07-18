import { motion } from "framer-motion";

const SpinnerLoader = ({ text = "Please wait..." }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-20 space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-t-4 border-primary border-solid rounded-full"
      />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

export default SpinnerLoader;
