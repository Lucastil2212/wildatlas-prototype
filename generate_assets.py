from PIL import Image, ImageDraw, ImageFilter
import math, random
from pathlib import Path

OUT = Path('/mnt/data/wildatlas-prototype/assets')
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1400, 900
random.seed(12)

def vertical_gradient(top, bottom):
    img = Image.new('RGB', (W, H))
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        col = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(W):
            px[x, y] = col
    return img

def add_noise(img, amount=14, opacity=20):
    noise = Image.new('L', img.size)
    npx = noise.load()
    for y in range(H):
        for x in range(W):
            npx[x, y] = random.randint(110-amount, 110+amount)
    noise = noise.filter(ImageFilter.GaussianBlur(0.35))
    layer = Image.new('RGBA', img.size, (255,255,255,0))
    layer.putalpha(noise.point(lambda p: int((p/255)*opacity)))
    return Image.alpha_composite(img.convert('RGBA'), layer)

def ellipse(draw, box, fill):
    draw.ellipse(tuple(map(int, box)), fill=fill)

def polygon(draw, pts, fill):
    draw.polygon([(int(x), int(y)) for x,y in pts], fill=fill)

def save(img, name):
    img.convert('RGB').save(OUT / name, quality=92, optimize=True)


def rainforest():
    img = vertical_gradient((6, 42, 47), (7, 104, 68)).convert('RGBA')
    d = ImageDraw.Draw(img, 'RGBA')
    # distant hills
    for layer, (y0, color, amp) in enumerate([(390,(22,91,78,210),95),(490,(11,76,55,230),120),(610,(5,58,39,255),150)]):
        pts=[(0,H)]
        for x in range(0,W+50,50):
            y=y0 + math.sin(x/170+layer)*amp*.25 + random.randint(-28,28)
            pts.append((x,y))
        pts.append((W,H))
        polygon(d,pts,color)
    # river
    polygon(d,[(500,900),(910,900),(790,690),(735,580),(700,520),(670,470),(640,430),(690,430),(760,490),(825,565),(930,700)],(54,181,165,210))
    polygon(d,[(600,900),(760,900),(748,720),(708,585),(670,500),(650,450),(680,440),(725,520),(780,670)],(169,238,210,70))
    # canopy circles
    for _ in range(380):
        x=random.randint(-40,W+40); y=random.randint(450,930); r=random.randint(14,55)
        col=random.choice([(12,92,48,230),(18,112,57,230),(30,131,67,210),(7,73,42,240)])
        ellipse(d,(x-r,y-r,x+r,y+r),col)
    # foreground trunks and leaves
    for x in [80,210,1190,1320]:
        d.rounded_rectangle((x-15,180,x+28,930),20,fill=(25,40,25,235))
        for _ in range(22):
            yy=random.randint(120,600); xx=x+random.randint(-120,120); rr=random.randint(22,60)
            ellipse(d,(xx-rr,yy-rr*.55,xx+rr,yy+rr*.55),(12,74,42,230))
    # mist
    mist=Image.new('RGBA',(W,H),(0,0,0,0)); md=ImageDraw.Draw(mist,'RGBA')
    for _ in range(18):
        x=random.randint(200,1200); y=random.randint(350,650); rx=random.randint(120,340); ry=random.randint(20,50)
        ellipse(md,(x-rx,y-ry,x+rx,y+ry),(210,255,235,18))
    mist=mist.filter(ImageFilter.GaussianBlur(22))
    img=Image.alpha_composite(img,mist)
    save(add_noise(img, 18, 14), 'biome-rainforest.jpg')


def savanna():
    img=vertical_gradient((43,32,75),(244,151,61)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    ellipse(d,(965,90,1165,290),(255,225,140,210))
    # distant ridges
    polygon(d,[(0,590),(180,540),(390,570),(620,500),(840,560),(1050,510),(1400,580),(1400,900),(0,900)],(96,72,70,180))
    polygon(d,[(0,650),(300,600),(510,640),(760,570),(980,630),(1200,590),(1400,640),(1400,900),(0,900)],(97,72,39,230))
    # grass base
    d.rectangle((0,680,W,H),fill=(90,67,27,255))
    for _ in range(800):
        x=random.randint(0,W); y=random.randint(650,H); h=random.randint(10,55)
        d.line((x,y,x+random.randint(-9,9),y-h),fill=random.choice([(201,144,53,150),(154,106,34,180),(238,176,72,100)]),width=random.randint(1,3))
    # acacia tree
    d.polygon([(275,690),(320,690),(340,380),(310,360)],fill=(34,31,26,255))
    d.line((325,450,205,330),fill=(35,31,25,255),width=22)
    d.line((318,470,455,340),fill=(35,31,25,255),width=20)
    for cx,cy,rx,ry in [(175,320,150,48),(310,300,210,65),(470,325,150,45),(260,265,120,38)]:
        ellipse(d,(cx-rx,cy-ry,cx+rx,cy+ry),(28,45,29,250))
    # distant giraffes
    for gx,gy,s in [(1020,710,1.0),(1120,740,.72)]:
        ellipse(d,(gx,gy-105*s,gx+42*s,gy-60*s),(52,39,28,220))
        d.rectangle((gx+12*s,gy-70*s,gx+29*s,gy),(52,39,28,220))
        d.rectangle((gx+28*s,gy-190*s,gx+41*s,gy-70*s),(52,39,28,220))
        ellipse(d,(gx+25*s,gy-215*s,gx+58*s,gy-185*s),(52,39,28,220))
        d.line((gx+10*s,gy,gx+3*s,gy+58*s),fill=(52,39,28,220),width=max(2,int(8*s)))
        d.line((gx+34*s,gy,gx+43*s,gy+58*s),fill=(52,39,28,220),width=max(2,int(8*s)))
    save(add_noise(img, 16, 12),'biome-savanna.jpg')


def coral():
    img=vertical_gradient((5,38,80),(0,165,177)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    # light shafts
    for x in range(-200,W,180):
        polygon(d,[(x,0),(x+80,0),(x+360,H),(x+210,H)],(150,244,255,16))
    # seabed
    polygon(d,[(0,720),(180,680),(390,735),(600,690),(820,735),(1050,670),(1270,720),(1400,690),(1400,900),(0,900)],(22,96,90,255))
    # corals
    colors=[(248,94,121,240),(255,179,71,230),(149,87,196,235),(54,211,153,220),(254,111,69,230)]
    for _ in range(75):
        x=random.randint(0,W); base=random.randint(720,900); col=random.choice(colors); height=random.randint(35,180)
        d.line((x,base,x+random.randint(-30,30),base-height),fill=col,width=random.randint(8,18))
        for b in range(random.randint(2,5)):
            yy=base-height*random.uniform(.25,.85); xx=x+random.randint(-22,22)
            d.line((xx,yy,xx+random.randint(-48,48),yy-random.randint(15,60)),fill=col,width=random.randint(5,13))
    # fish
    for _ in range(34):
        x=random.randint(70,W-70); y=random.randint(150,680); s=random.randint(12,34); direction=random.choice([-1,1]); col=random.choice([(255,215,74,220),(92,236,255,210),(247,103,147,210),(255,255,255,170)])
        ellipse(d,(x-s*1.5,y-s*.65,x+s*1.5,y+s*.65),col)
        polygon(d,[(x-direction*s*1.45,y),(x-direction*s*2.2,y-s*.75),(x-direction*s*2.2,y+s*.75)],col)
    # bubbles
    for _ in range(85):
        x=random.randint(0,W); y=random.randint(80,H); r=random.randint(2,12)
        d.ellipse((x-r,y-r,x+r,y+r),outline=(210,255,255,95),width=2)
    save(add_noise(img, 10, 10),'biome-coral.jpg')


def arctic():
    img=vertical_gradient((8,19,54),(66,151,191)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    # aurora ribbons
    aur=Image.new('RGBA',(W,H),(0,0,0,0)); ad=ImageDraw.Draw(aur,'RGBA')
    for i,col in enumerate([(92,255,188,65),(111,175,255,45),(170,101,255,35)]):
        pts=[]
        for x in range(-100,W+100,30):
            y=110+i*45+math.sin(x/140+i)*55+math.sin(x/51)*18
            pts.append((x,y))
        pts2=[(x,y+60+i*15) for x,y in reversed(pts)]
        polygon(ad,pts+pts2,col)
    aur=aur.filter(ImageFilter.GaussianBlur(28)); img=Image.alpha_composite(img,aur); d=ImageDraw.Draw(img,'RGBA')
    # mountains
    polygon(d,[(0,620),(190,360),(360,610),(550,310),(740,610),(940,390),(1160,610),(1290,440),(1400,610),(1400,900),(0,900)],(180,222,237,245))
    polygon(d,[(0,620),(190,360),(270,520),(350,470),(360,610),(550,310),(620,470),(710,430),(740,610),(940,390),(1015,505),(1080,470),(1160,610),(1290,440),(1400,610),(1400,900),(0,900)],(119,183,211,210))
    # ice field
    d.rectangle((0,625,W,H),fill=(209,237,242,255))
    for _ in range(35):
        x=random.randint(0,W); y=random.randint(650,H); w=random.randint(40,180); h=random.randint(8,32)
        polygon(d,[(x,y),(x+w,y-random.randint(0,25)),(x+w+random.randint(10,40),y+h),(x-random.randint(10,30),y+h)],(117,200,219,130))
    # polar bear silhouette
    x,y=1040,720
    ellipse(d,(x-120,y-70,x+95,y+60),(246,250,244,245))
    ellipse(d,(x+65,y-82,x+150,y-10),(246,250,244,245))
    ellipse(d,(x+85,y-100,x+115,y-72),(246,250,244,245))
    for lx in [x-80,x+20,x+80]: d.rounded_rectangle((lx,y+25,lx+28,y+115),10,fill=(238,245,241,245))
    ellipse(d,(x+126,y-56,x+142,y-40),(24,38,48,220))
    save(add_noise(img,10,9),'biome-arctic.jpg')


def islands():
    img=vertical_gradient((17,58,104),(74,191,207)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    # clouds
    for cx,cy,s in [(230,170,1.2),(1060,130,.9),(760,230,.55)]:
        for ox,oy,r in [(-60,10,55),(0,-10,80),(65,12,50),(20,25,70)]:
            ellipse(d,(cx+(ox-r)*s,cy+(oy-r*.55)*s,cx+(ox+r)*s,cy+(oy+r*.55)*s),(245,252,247,145))
    # ocean
    d.rectangle((0,500,W,H),fill=(22,139,167,255))
    for yy in range(525,H,32):
        for x in range(-30,W,120):
            d.arc((x,yy,x+75,yy+20),0,180,fill=(165,241,239,60),width=3)
    # volcano island
    polygon(d,[(260,680),(430,580),(560,520),(690,330),(820,520),(970,590),(1140,680)],(54,83,64,255))
    polygon(d,[(690,330),(610,530),(760,500)],(116,128,99,190))
    polygon(d,[(260,680),(500,570),(690,550),(840,570),(1140,680),(1050,760),(350,760)],(51,129,75,255))
    # beach
    polygon(d,[(310,700),(480,650),(690,640),(910,660),(1090,710),(1010,745),(430,750)],(235,210,130,210))
    # tortoise
    ellipse(d,(530,650,760,790),(68,77,53,245)); ellipse(d,(720,700,805,760),(76,89,59,245))
    for bx,by in [(565,765),(690,770)]: ellipse(d,(bx,by,bx+52,by+45),(64,72,51,245))
    # birds
    for x,y,s in [(1120,250,1),(1190,305,.7),(180,330,.65)]:
        d.arc((x-45*s,y-20*s,x,y+25*s),200,345,fill=(25,36,45,200),width=max(2,int(5*s)))
        d.arc((x,y-20*s,x+45*s,y+25*s),195,340,fill=(25,36,45,200),width=max(2,int(5*s)))
    save(add_noise(img,12,10),'biome-islands.jpg')


def wetlands():
    img=vertical_gradient((11,48,54),(83,129,73)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    # cypress silhouettes
    for x in range(40,W,120):
        h=random.randint(300,560); base=660
        d.rectangle((x-9,base-h,x+12,base),fill=(28,45,31,235))
        for _ in range(10):
            yy=base-h+random.randint(20,h-40); length=random.randint(40,110)
            d.line((x,yy,x+random.choice([-1,1])*length,yy+random.randint(-15,20)),fill=(30,54,34,220),width=random.randint(7,15))
    # water
    d.rectangle((0,610,W,H),fill=(31,92,89,255))
    for yy in range(640,H,38):
        for x in range(-50,W,135):
            d.arc((x,yy,x+100,yy+24),0,180,fill=(164,210,180,50),width=3)
    # lily pads
    for _ in range(50):
        x=random.randint(0,W); y=random.randint(630,H); rx=random.randint(12,45)
        ellipse(d,(x-rx,y-rx*.35,x+rx,y+rx*.35),random.choice([(62,126,68,180),(79,149,76,170),(43,110,66,190)]))
    # reeds foreground
    for _ in range(180):
        x=random.randint(0,W); y=random.randint(720,H); h=random.randint(40,200)
        d.line((x,y,x+random.randint(-15,15),y-h),fill=(77,111,45,200),width=random.randint(2,6))
    # alligator eyes/ridge
    x,y=960,760
    polygon(d,[(760,y),(875,y-35),(1040,y-38),(1160,y),(1040,y+28),(860,y+25)],(26,51,39,220))
    ellipse(d,(935,y-55,970,y-20),(79,112,62,230)); ellipse(d,(1025,y-57,1060,y-22),(79,112,62,230))
    ellipse(d,(948,y-45,958,y-35),(245,191,72,255)); ellipse(d,(1038,y-47,1048,y-37),(245,191,72,255))
    save(add_noise(img,15,12),'biome-wetlands.jpg')


def temperate():
    img=vertical_gradient((20,41,72),(123,184,176)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    # mountains
    polygon(d,[(0,650),(160,470),(320,600),(520,350),(760,610),(930,430),(1160,650),(1270,530),(1400,650),(1400,900),(0,900)],(86,111,111,255))
    polygon(d,[(520,350),(450,500),(560,450),(620,530)],(226,236,228,220))
    polygon(d,[(930,430),(865,530),(950,490),(1015,560)],(220,234,228,180))
    # forest layers
    for layer,(y0,col,scale) in enumerate([(590,(30,80,62,210),.85),(650,(24,64,49,235),1.0),(730,(19,49,39,255),1.25)]):
        for x in range(-40,W+40,int(70/scale)):
            h=random.randint(int(90*scale),int(220*scale)); w=h*.48
            polygon(d,[(x,y0),(x+w/2,y0-h),(x+w,y0)],col)
            d.rectangle((x+w*.46,y0-15,x+w*.56,y0+30),fill=col)
    # lake
    polygon(d,[(0,760),(250,720),(600,750),(890,710),(1130,750),(1400,720),(1400,900),(0,900)],(41,105,126,230))
    for yy in range(770,H,25):
        d.line((0,yy,W,yy+random.randint(-3,3)),fill=(158,215,213,35),width=3)
    # geyser plume
    mist=Image.new('RGBA',(W,H),(0,0,0,0)); md=ImageDraw.Draw(mist,'RGBA')
    for _ in range(28):
        cx=1070+random.randint(-80,80); cy=560-random.randint(0,280); rx=random.randint(25,95); ry=random.randint(20,80)
        ellipse(md,(cx-rx,cy-ry,cx+rx,cy+ry),(240,251,247,30))
    mist=mist.filter(ImageFilter.GaussianBlur(18)); img=Image.alpha_composite(img,mist)
    save(add_noise(img,12,10),'biome-temperate.jpg')


def desert():
    img=vertical_gradient((19,31,67),(233,126,62)).convert('RGBA')
    d=ImageDraw.Draw(img,'RGBA')
    ellipse(d,(1030,100,1190,260),(255,224,145,200))
    polygon(d,[(0,590),(300,450),(570,600),(850,430),(1100,600),(1400,470),(1400,900),(0,900)],(144,74,70,210))
    polygon(d,[(0,680),(280,570),(560,700),(850,570),(1120,710),(1400,610),(1400,900),(0,900)],(196,109,62,240))
    polygon(d,[(0,760),(310,660),(620,760),(950,650),(1400,760),(1400,900),(0,900)],(221,146,77,255))
    # cacti
    for x,y,s in [(250,720,1),(1180,755,.7),(850,690,.45)]:
        col=(36,91,67,230)
        d.rounded_rectangle((x-18*s,y-170*s,x+18*s,y),int(14*s),fill=col)
        d.line((x,y-110*s,x-55*s,y-145*s),fill=col,width=max(4,int(22*s)))
        d.line((x-55*s,y-145*s,x-55*s,y-190*s),fill=col,width=max(4,int(20*s)))
        d.line((x,y-85*s,x+55*s,y-120*s),fill=col,width=max(4,int(22*s)))
        d.line((x+55*s,y-120*s,x+55*s,y-158*s),fill=col,width=max(4,int(20*s)))
    save(add_noise(img,12,10),'biome-desert.jpg')

rainforest(); savanna(); coral(); arctic(); islands(); wetlands(); temperate(); desert()
print('generated', len(list(OUT.glob('biome-*.jpg'))), 'biome images')
