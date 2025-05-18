import os
import zipfile

def zip_project(folder_path='.', zip_name='my_project.zip'):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for folder, subfolders, files in os.walk(folder_path):
            for file in files:
                if file == zip_name or file.startswith('.'):
                    continue
                full_path = os.path.join(folder, file)
                arcname = os.path.relpath(full_path, folder_path)
                zipf.write(full_path, arcname)
    print(f'✅ Zipped as: {zip_name}')

zip_project()
