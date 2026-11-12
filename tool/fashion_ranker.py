"""Local, CPU-only fashion image encoder. JSONL stdin/stdout; no network API port."""
import base64, io, json, os, pathlib, sys, traceback
ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / '.ai-runtime' / 'models' / 'huggingface'
IMAGES = (ROOT / '.ai-runtime' / 'images').resolve()
os.environ['HF_HOME'] = str(CACHE)
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'
os.environ['HF_HUB_DISABLE_PROGRESS_BARS'] = '1'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
import torch
from PIL import Image, ImageOps
import open_clip
torch.set_num_threads(4)
Image.MAX_IMAGE_PIXELS = 24_000_000
LABELS = [
 ('cami_top', 'a photo of a camisole top, an upper body top with thin spaghetti shoulder straps'),
 ('tank', 'a photo of a tank top or sleeveless vest top with wide shoulder straps'),
 ('slip_dress', 'a photo of a slip dress, a one piece dress with thin shoulder straps extending below the hips'),
 ('dress', 'a photo of a dress, a one piece garment with a bodice and a skirt'),
 ('skirt', 'a photo of a skirt, a separate garment worn around the waist'),
 ('shirt', 'a photo of a button up shirt or blouse'),
 ('tee', 'a photo of a short sleeved T-shirt'),
 ('sweater', 'a photo of a knitted sweater or jumper'),
 ('cardigan', 'a photo of a knitted cardigan with an opening in the front'),
 ('hoodie', 'a photo of a hoodie or sweatshirt'),
 ('jacket', 'a photo of a jacket or blazer'),
 ('coat', 'a photo of a long overcoat or trench coat'),
 ('pants', 'a photo of full length trousers or pants'),
 ('shorts', 'a photo of shorts'),
 ('jeans', 'a photo of denim jeans'),
 ('jumpsuit', 'a photo of a one piece jumpsuit or romper with trouser legs'),
 ('bodysuit', 'a photo of a fitted bodysuit with a crotch fastening'),
 ('underwear', 'a photo of a bra, bralette or underwear'),
 ('swimwear', 'a photo of a bikini or swimsuit'),
 ('other', 'a photo of shoes, a handbag, accessories or a non clothing object'),
]
print('Loading Marqo fashionSigLIP on CPU...', file=sys.stderr, flush=True)
model, _, preprocess = open_clip.create_model_and_transforms('hf-hub:Marqo/marqo-fashionSigLIP', device='cpu', cache_dir=str(CACHE))
tokenizer = open_clip.get_tokenizer('hf-hub:Marqo/marqo-fashionSigLIP', cache_dir=str(CACHE))
model.eval()
with torch.inference_mode():
    text_features = model.encode_text(tokenizer([t for _, t in LABELS]))
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
print(json.dumps({'ready':True,'model':'Marqo/marqo-fashionSigLIP','device':'cpu','categories':[k for k,_ in LABELS]}), flush=True)
if '--warmup' in sys.argv:
    sys.exit(0)
for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        image_path = pathlib.Path(request['imagePath']).resolve()
        if not image_path.is_relative_to(IMAGES):
            raise ValueError('Image must be in the tool image cache')
        with Image.open(image_path) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            image.thumbnail((1024, 1024))
            views=[image]
            focus=request.get('focus')=='upper_body'
            if focus:
                w,h=image.size
                views.append(image.crop((int(w*.12),int(h*.10),int(w*.88),int(h*.66))))
            tensor=torch.stack([preprocess(v) for v in views])
            encoded = io.BytesIO()
            image.save(encoded, format='JPEG', quality=90)
        with torch.inference_mode():
            embedding = model.encode_image(tensor)
            embedding = embedding / embedding.norm(dim=-1, keepdim=True)
            all_scores=(embedding @ text_features.T).tolist()
            scores=all_scores[-1]
        ranked = sorted([{'category':LABELS[i][0], 'similarity':round(s,6)} for i,s in enumerate(scores)], key=lambda v:v['similarity'], reverse=True)
        full_rank=sorted([{'category':LABELS[i][0],'similarity':round(s,6)} for i,s in enumerate(all_scores[0])],key=lambda v:v['similarity'],reverse=True)
        full_margin=full_rank[0]['similarity']-full_rank[1]['similarity']
        focused_margin=ranked[0]['similarity']-ranked[1]['similarity']
        selected_view='upper_body' if focus else 'full_image'
        if full_margin>focused_margin:
            ranked=full_rank
            selected_view='full_image'
        output = {'id':request.get('id'), 'category':ranked[0]['category'], 'margin':round(ranked[0]['similarity']-ranked[1]['similarity'],6), 'ranked':ranked[:6], 'fullCategory':full_rank[0]['category'], 'focus':selected_view, 'imageBase64':base64.b64encode(encoded.getvalue()).decode('ascii'), 'model':'Marqo/marqo-fashionSigLIP'}
        print(json.dumps(output), flush=True)
    except Exception as exc:
        print(json.dumps({'id':request.get('id'), 'error':str(exc)}), flush=True)
