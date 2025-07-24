"use client"; // Only needed if using in app/ directory with client features

import React from "react";

function SkeletonProduct() {
  const shimmerStyle = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e2e2e2 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.2s infinite",
    borderRadius: "8px",
    marginBottom: "16px",
  };

  const styles = {
    skeletonBox: (height, width = "100%") => ({
      ...shimmerStyle,
      height,
      width,
    }),
    container: {
      display: "flex",
      gap: "20px",
      padding: "30px",
    },
    left: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    right: {
      flex: 2,
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  };

  return (
    <>
      {/* Keyframes for shimmer animation */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>

      <section style={styles.container}>
        <div style={styles.left}>
          <div style={styles.skeletonBox("300px")} />
          <div style={styles.skeletonBox("80px")} />
          <div style={styles.skeletonBox("80px")} />
        </div>

        <div style={styles.right}>
          <div style={styles.skeletonBox("32px", "70%")} />
          <div style={styles.skeletonBox("20px", "50%")} />
          <div style={styles.skeletonBox("20px", "40%")} />
          <div style={styles.skeletonBox("20px", "60%")} />
          <div style={styles.skeletonBox("20px", "30%")} />
          <div style={styles.skeletonBox("40px", "30%")} />
        </div>
      </section>
    </>
  );
}

export default SkeletonProduct;
