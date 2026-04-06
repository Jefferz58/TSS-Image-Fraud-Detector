import requests
import sys
import base64
import io
from PIL import Image, ImageDraw
from datetime import datetime
import json

class TSS_API_Tester:
    def __init__(self, base_url="https://image-forensics-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=60)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_image(self):
        """Create a test image with actual visual content"""
        # Create a 200x200 image with some visual features
        img = Image.new('RGB', (200, 200), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add some visual elements
        draw.rectangle([50, 50, 150, 150], fill='blue', outline='black', width=2)
        draw.ellipse([75, 75, 125, 125], fill='red')
        draw.text((10, 10), "Test Image", fill='black')
        draw.line([(0, 0), (200, 200)], fill='green', width=3)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        img_bytes = buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        return img_base64

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "api/",
            200
        )
        if success:
            expected_message = "TSS Image Fraud Detector API v1.0"
            if isinstance(response, dict) and response.get('message') == expected_message:
                print(f"✅ Correct message returned: {response.get('message')}")
                return True
            else:
                print(f"❌ Unexpected message: {response}")
                return False
        return False

    def test_analyze_endpoint(self):
        """Test /api/analyze endpoint with real image"""
        print("\n🖼️  Creating test image with visual content...")
        test_image_base64 = self.create_test_image()
        print(f"   Image size: {len(test_image_base64)} characters")
        
        success, response = self.run_test(
            "Image Analysis",
            "POST",
            "api/analyze",
            200,
            data={
                "image_base64": test_image_base64,
                "media_type": "image/jpeg"
            }
        )
        
        if success and isinstance(response, dict):
            # Check required fields
            required_fields = [
                'verdict', 'confidence', 'riskLevel', 'summary', 
                'indicators', 'recommendation', 'flaggedElements', 
                'fraudRiskScore', 'fraudRiskTier', 'analyzedAt'
            ]
            
            missing_fields = []
            for field in required_fields:
                if field not in response:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            # Validate indicators structure
            indicators = response.get('indicators', [])
            if len(indicators) != 8:
                print(f"❌ Expected 8 indicators, got {len(indicators)}")
                return False
            
            # Check indicator structure
            for i, indicator in enumerate(indicators):
                if not all(key in indicator for key in ['category', 'status', 'detail']):
                    print(f"❌ Indicator {i} missing required keys")
                    return False
            
            print(f"✅ Analysis complete with verdict: {response.get('verdict')}")
            print(f"   Fraud Risk Score: {response.get('fraudRiskScore')}")
            print(f"   Confidence: {response.get('confidence')}%")
            print(f"   Indicators: {len(indicators)} items")
            
            return True
        
        return False

def main():
    print("🚀 Starting TSS Image Fraud Detector API Tests")
    print("=" * 60)
    
    tester = TSS_API_Tester()
    
    # Test sequence
    tests = [
        ("Health Endpoint", tester.test_health_endpoint),
        ("Root Endpoint", tester.test_root_endpoint),
        ("Analyze Endpoint", tester.test_analyze_endpoint),
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        try:
            success = test_func()
            if not success:
                print(f"❌ {test_name} failed - stopping tests")
                break
        except Exception as e:
            print(f"❌ {test_name} crashed: {str(e)}")
            break
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())