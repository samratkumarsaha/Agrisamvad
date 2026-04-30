let device, server, characteristic;

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_UUID    = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

async function connectBLE() {
    try {
        document.getElementById("status").innerText = "Scanning...";

        device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });

        device.addEventListener('gattserverdisconnected', () => {
            document.getElementById("status").innerText = "Disconnected ❌";
        });

        document.getElementById("status").innerText = "Connecting...";

        server = await device.gatt.connect();

        console.log("✅ Connected to GATT");

        // 🔥 GET ALL SERVICES (no UUID dependency)
        const services = await server.getPrimaryServices();

        console.log("Services:", services);

        for (let service of services) {
            try {
                const characteristics = await service.getCharacteristics();

                for (let char of characteristics) {
                    console.log("Trying char:", char.uuid);

                    try {
                        await char.startNotifications();

                        char.addEventListener(
                            "characteristicvaluechanged",
                            handleData
                        );

                        characteristic = char;

                        document.getElementById("status").innerText = "Connected ✅";
                        console.log("✅ Working characteristic found:", char.uuid);

                        return;

                    } catch (e) {
                        // ignore and try next
                    }
                }

            } catch (e) {
                // ignore service
            }
        }

        document.getElementById("status").innerText = "❌ No readable characteristic found";

    } catch (error) {
        console.error("💥 ERROR:", error);
        document.getElementById("status").innerText = "Connection failed ❌";
    }
}

function handleData(event) {
    try {
        let value = new TextDecoder().decode(event.target.value);
        console.log("RAW:", value);

        let parts = value.split(",");

        if (parts.length < 3) return;

        document.getElementById("soil").innerText = parts[0].split(":")[1];
        document.getElementById("hum").innerText  = parts[1].split(":")[1];
        document.getElementById("temp").innerText = parts[2].split(":")[1];

    } catch (e) {
        console.log("Parse error:", e);
    }
}