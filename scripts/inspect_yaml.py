p = r'C:/Users/dilip/Downloads/Dask-Team--main/Dask-Team--main/ATTENDANCE-SYSTEM/.github/workflows/build-and-push.yml'
with open(p,'rb') as f:
    for i,line in enumerate(f, start=1):
        print(f"{i:03}: {line!r}")
