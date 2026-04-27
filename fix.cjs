const fs = require('fs');

const filepath = 'src/app/components/SearchPage.tsx';
let text = fs.readFileSync(filepath, 'utf-8');

const target1_old = `{(house.image || house.images?.[0]) && (
              <img
                src={house.image || house.images![0]}
                alt={house.name}
                className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            )}`;

const target1_new = `{(() => {
              const src = house.images?.find(img => img && !img.startsWith('data:')) 
                || (house.image && !house.image.startsWith('data:') ? house.image : null)
                || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
              return (
                <img
                  src={src}
                  alt={house.name}
                  className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80';
                  }}
                />
              );
            })()}`;

if (text.includes(target1_old)) {
  text = text.replace(target1_old, target1_new);
  console.log('Target 1 replaced');
} else {
  console.log('Target 1 not found');
}

const target2_regex = /images:\s*Array\.isArray\(house\.images\)\s*&&\s*house\.images\.length\s*>\s*0\s*\?\s*house\.images\s*:\s*house\.image\s*\?\s*\[house\.image\]\s*:\s*\[roomImages\[index\s*%\s*roomImages\.length\]\],/;

const target2_new = `images: (() => {
                const validImages = Array.isArray(house.images)
                  ? house.images.filter((img) => 
                      typeof img === 'string' && 
                      img.trim().length > 0 &&
                      !img.startsWith('data:image') 
                    )
                  : [];
                
                if (validImages.length > 0) return validImages;
                
                if (typeof house.image === 'string' && 
                    house.image.trim() && 
                    !house.image.startsWith('data:image')) {
                  return [house.image];
                }
                
                return [roomImages[index % roomImages.length]];
              })(),`;

if (target2_regex.test(text)) {
  text = text.replace(target2_regex, target2_new);
  console.log('Target 2 replaced');
} else {
  console.log('Target 2 not found');
}

fs.writeFileSync(filepath, text, 'utf-8');
