import type { SVGProps } from 'react';

function SvgComponent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={512}
      height={212}
      viewBox="0 0 512 212"
      preserveAspectRatio="xMidYMid"
      {...props}
    >
      <path
        fill="currentColor"
        d="M272.696 40.203l-.002 84.896 31.185-31.178 15.74 15.741-57.642 57.638-58.369-58.369 15.741-15.741 31.085 31.085.001-84.072zM72.162 162.979V97.232l40.255 40.257 40.56-40.557v65.383h22.261V43.192l-62.82 62.816-62.517-62.521v119.492z"
      />
      <path
        fill="currentColor"
        opacity="0.6"
        d="M447.847 36.651l15.74 15.741-47.149 47.147 45.699 45.701-15.741 15.741-45.7-45.699-45.701 45.699-15.74-15.741 45.695-45.701-47.146-47.147 15.74-15.741 47.152 47.146z"
      />
    </svg>
  );
}

export default SvgComponent;
