import { motion } from "framer-motion";

function Marquee({ items, speed = 50, direction = "left", className = "" }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: direction === "left" ? ["0%", "-100%"] : ["-100%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {[...items, ...items].map((item, index) => (
          <div key={index} className="inline-flex items-center px-8">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default Marquee;