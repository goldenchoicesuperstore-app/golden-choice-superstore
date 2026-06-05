"use client";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export default function Skeleton({ width, height, rounded = "rounded-md", className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 ${rounded} ${className}`} 
      style={{ width, height }}
    />
  );
}
