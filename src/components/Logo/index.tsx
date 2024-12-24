const rainbow = '#ed3833, #f5a640, #fdf851, #3b841e, #2143ef, #992f83';
const ace = 'black, grey, white, purple, purple, purple';
const trans = '#5bcef9, #f3a9b8, white, #f3a9b8, #5bcef9, #5bcef9';
const pan = '#ec428d, #fcd94b, #fcd94b, #43b2f8, #43b2f8, #43b2f8';
const genderqueer = '#b899dd , #b899dd, white, #6b8e3a, #6b8e3a, #6b8e3a';
const enby = '#f7ed4e, white, #9655ca, black, black, black';
const bi = '#d2376d, #d2376d, #704d91, #0036a2, #0036a2, #0036a2';
const lesbian = '#d4312c, #f39753, #ffffff, #d161a2, #a32b61, #a32b61';
const colors = [rainbow, ace, trans, pan, genderqueer, enby, bi, lesbian];

const Logo = () => {
  const item = colors[Math.floor(Math.random() * colors.length)];
  const fillInColors = item.split(',').reverse();
  return (
    <div className="px-4 py-4">
      <svg
        width="70"
        height="70"
        version="1.1"
        viewBox="0 0 1919.9999 1840.3073"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="a">
            <path
              d="m694.21-1060.1c-34.8-0.082-65.909 2.3606-91.271 4.5807-281.47 24.638-448.4 314.01-448.4 525.64-1e-3 211.62 74.676 497.55 510.43 774.19 435.76 276.64 416.72 379.42 449.57 535.9 32.845-156.48 13.811-259.27 449.57-535.9 435.76-276.64 510.43-562.56 510.43-774.19 0-211.62-166.93-501-448.4-525.64-115.94-10.149-352-24.983-511.6 218.3-124.69-190.06-296.04-222.58-420.33-222.88z"
              color="#000000"
              colorRendering="auto"
              fill="#f00"
              imageRendering="auto"
              shapeRendering="auto"
              style={{ isolation: 'auto', mixBlendMode: 'normal' }}
            />
          </clipPath>
        </defs>
        <g transform="translate(-154.53 1060.1)">
          <g clipPath="url(#a)">
            <g transform="matrix(4.0693 -1.0904 1.0904 4.0693 -791.38 -796.41)">
              <rect width="777" height="520" fill={fillInColors[0]} />
              <rect width="777" height="440" fill={fillInColors[1]} />
              <rect width="777" height="360" fill={fillInColors[2]} />
              <rect width="777" height="280" fill={fillInColors[3]} />
              <rect width="777" height="200" fill={fillInColors[4]} />
              <rect width="777" height="120" fill={fillInColors[5]} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Logo;
