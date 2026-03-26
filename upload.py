import os
from huggingface_hub import HfApi

api = HfApi()

api.upload_folder(
    folder_path="C:/LoHA_AppMP_framework",
    repo_id="remiai3/REMI_Framework_V2",
    repo_type="dataset",
    token=os.environ["HF_TOKEN"],
)
