from setuptools import setup, find_packages

setup(
    name="omni-meet",
    version="0.1.0",
    py_modules=["main", "audio_capture"],
    install_requires=[
        "sounddevice>=0.4.6",
        "numpy>=1.26.0",
        "websockets>=12.0",
        "pystray>=0.19.5",
        "pillow>=10.2.0",
        "requests>=2.31.0",
    ],
    entry_points={
        "console_scripts": [
            "omni-meet=main:main",
        ],
    },
    author="OmniAgentOS Team",
    description="Omni Meet Satellite Extension",
    python_requires=">=3.8",
)
