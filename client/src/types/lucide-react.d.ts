declare module 'lucide-react' {
  import React from 'react';
  export interface IconProps extends React.SVGAttributes<SVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
  }
  export type Icon = React.FC<IconProps>;

  // Add the specific icons you're using
  export const AtSign: Icon;
  export const MapPinIcon: Icon;
  export const GlobeIcon: Icon;
  export const DownloadIcon: Icon;
  export const Linkedin: Icon;
  export const Github: Icon;
  // Add any other icons you're using in your project
}